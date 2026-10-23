// Runs against the Firestore emulator; see jest.rules.config.js.
const fs = require("node:fs");
const path = require("node:path");
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require("@firebase/rules-unit-testing");
const { deleteDoc, doc, getDoc, setDoc } = require("firebase/firestore");

let testEnv;

const asGuest = () => testEnv.unauthenticatedContext().firestore();
const asUser = (uid) => testEnv.authenticatedContext(uid).firestore();

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-jolo",
    firestore: {
      rules: fs.readFileSync(path.join(__dirname, "../../firestore.rules"), "utf8"),
    },
  });
});

afterAll(() => testEnv.cleanup());

beforeEach(async () => {
  await testEnv.clearFirestore();
  // Seed data as the Admin SDK would, bypassing the rules.
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "cafes/cafe1"), { name: "Test Café" });
    await setDoc(doc(db, "users/alice"), { displayName: "Alice" });
    await setDoc(doc(db, "users/alice/private/account"), { email: "alice@example.com" });
  });
});

describe("cafes", () => {
  it("can be read by anyone, signed in or not", async () => {
    await assertSucceeds(getDoc(doc(asGuest(), "cafes/cafe1")));
    await assertSucceeds(getDoc(doc(asUser("alice"), "cafes/cafe1")));
  });

  it("cannot be written from the app", async () => {
    await assertFails(setDoc(doc(asUser("alice"), "cafes/cafe1"), { name: "Renamed" }));
    await assertFails(setDoc(doc(asUser("alice"), "cafes/new"), { name: "Fake Café" }));
  });
});

describe("users", () => {
  it("are hidden from signed-out visitors", async () => {
    await assertFails(getDoc(doc(asGuest(), "users/alice")));
  });

  it("can be read by any signed-in user", async () => {
    await assertSucceeds(getDoc(doc(asUser("bob"), "users/alice")));
  });

  it("can only be created and updated by their owner", async () => {
    await assertSucceeds(setDoc(doc(asUser("bob"), "users/bob"), { displayName: "Bob" }));
    await assertSucceeds(setDoc(doc(asUser("alice"), "users/alice"), { displayName: "Al" }));
    await assertFails(setDoc(doc(asUser("bob"), "users/alice"), { displayName: "Hacked" }));
  });

  it("cannot be deleted from the app", async () => {
    await assertFails(deleteDoc(doc(asUser("alice"), "users/alice")));
  });
});

describe("users/{uid}/private", () => {
  it("is readable and writable only by the owner", async () => {
    const own = doc(asUser("alice"), "users/alice/private/account");
    await assertSucceeds(getDoc(own));
    await assertSucceeds(setDoc(own, { email: "new@example.com" }));

    const other = doc(asUser("bob"), "users/alice/private/account");
    await assertFails(getDoc(other));
    await assertFails(setDoc(other, { email: "bob@example.com" }));
  });
});

describe("everything else", () => {
  it("stays locked until its feature has rules", async () => {
    await assertFails(getDoc(doc(asUser("alice"), "posts/p1")));
    await assertFails(setDoc(doc(asUser("alice"), "posts/p1"), { text: "hi" }));
  });
});
