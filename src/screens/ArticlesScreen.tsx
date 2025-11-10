import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import styles from '../ui/styles';
import BlogCard from '../components/BlogCard';
import { fetchLatestPosts, WPPost } from '../lib/blog';

export default function ArticlesScreen() {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await fetchLatestPosts(7);
      setPosts(data);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={{ flex: 1 }}>
      {err ? (
        <Text style={{ color: '#ef4444', paddingHorizontal: 16, marginTop: 8 }}>{err}</Text>
      ) : null}
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => <BlogCard post={item} />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        ListHeaderComponent={<Text style={[styles.sectionTitle, { marginLeft: 16, marginTop: 8 }]}>最新の投稿</Text>}
        ListEmptyComponent={
          !loading ? <Text style={{ color: '#64748b', padding: 16 }}>まだ記事が取得できませんでした。</Text> : null
        }
      />
    </View>
  );
}
