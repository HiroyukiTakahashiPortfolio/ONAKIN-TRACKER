import React from 'react';
import { View, Text, Image, Pressable, Linking } from 'react-native';
import styles from '../ui/styles';
import { WPPost, featuredImage, stripAndTrim } from '../lib/blog';

export default function BlogCard({ post }: { post: WPPost }) {
  const thumb = featuredImage(post);
  const onOpen = () => Linking.openURL(post.link);

  return (
    <Pressable onPress={onOpen} style={[styles.card, { flexDirection: 'row', gap: 12 }]}>
      {thumb ? (
        <Image
          source={{ uri: thumb }}
          style={{ width: 96, height: 64, borderRadius: 8, backgroundColor: '#e2e8f0' }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: 96, height: 64, borderRadius: 8, backgroundColor: '#e2e8f0' }} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800' }} numberOfLines={2}>
          {post.title.rendered.replace(/<[^>]*>/g, '')}
        </Text>
        <Text style={{ color: '#64748b', marginTop: 4 }} numberOfLines={2}>
          {stripAndTrim(post.excerpt.rendered)}
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>
          {new Date(post.date).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
}
