import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore/lite";
import { db } from "@/FirebaseConfig";

function toPost(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    authorId: data.authorId,
    authorName: data.authorName,
    cafeId: data.cafeId,
    cafeName: data.cafeName,
    drink: data.drink,
    rating: data.rating,
    comment: data.comment,
    // Lite has no realtime listeners, so a post created this session hasn't
    // round-tripped a server timestamp yet; fall back to "now" for sorting.
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  };
}

// The feed is small enough (one drink review per post, no media) that one
// read of the whole collection is simpler than paginating, matching useCafes.
export function usePosts() {
  const [state, setState] = useState({ posts: [], loading: true, error: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const snapshot = await getDocs(collection(db, "posts"));
      const posts = snapshot.docs.map(toPost).sort((a, b) => b.createdAt - a.createdAt);
      setState({ posts, loading: false, error: null });
    } catch (error) {
      setState({ posts: [], loading: false, error });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createPost = useCallback(
    async ({ authorId, authorName, cafeId, cafeName, drink, rating, comment }) => {
      await addDoc(collection(db, "posts"), {
        authorId,
        authorName,
        cafeId,
        cafeName,
        drink,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      await load();
    },
    [load]
  );

  return { ...state, reload: load, createPost };
}
