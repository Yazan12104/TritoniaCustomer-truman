import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProductImage } from "../types";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";

const FALLBACK_IMAGE_URI = "https://via.placeholder.com/600x400?text=No+Image";
const DEFAULT_ASPECT_RATIO = 1.5;
const LOOP_BLOCK_COUNT = 3;

interface ProductImageCarouselProps {
  images: ProductImage[];
  height?: number;
}

const getImageUri = (image?: ProductImage) => image?.image_url || FALLBACK_IMAGE_URI;

export const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images, height }) => {
  const colors = useThemeColors();
  const flatListRef = useRef<FlatList<ProductImage>>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [imageAspectRatios, setImageAspectRatios] = useState<Record<string, number>>({});
  const [containerWidth, setContainerWidth] = useState(() => Dimensions.get("window").width);

  const hasImages = images.length > 0;
  const canLoop = images.length > 1;
  const baseSectionStartIndex = canLoop ? images.length : 0;

  const carouselImages = useMemo(() => {
    if (!canLoop) return images;
    return Array.from({ length: LOOP_BLOCK_COUNT }, () => images).flat();
  }, [canLoop, images]);

  const resolveOriginalIndex = useCallback(
    (candidateIndex: number) => {
      if (!canLoop || images.length === 0) return 0;
      return ((candidateIndex % images.length) + images.length) % images.length;
    },
    [canLoop, images.length]
  );

  const recenterIfNeeded = useCallback(
    (candidateIndex: number) => {
      if (!canLoop) return candidateIndex;

      if (candidateIndex < images.length || candidateIndex >= images.length * 2) {
        const normalizedIndex = resolveOriginalIndex(candidateIndex);
        const recenteredIndex = baseSectionStartIndex + normalizedIndex;

        flatListRef.current?.scrollToOffset({
          offset: recenteredIndex * containerWidth,
          animated: false,
        });

        return recenteredIndex;
      }

      return candidateIndex;
    },
    [baseSectionStartIndex, canLoop, containerWidth, images.length, resolveOriginalIndex]
  );

  useEffect(() => {
    if (!hasImages) return;

    let cancelled = false;

    const readAspectRatio = (image: ProductImage) =>
      new Promise<{ key: string; ratio: number }>((resolve) => {
        const imageUri = getImageUri(image);
        Image.getSize(
          imageUri,
          (width, height) => {
            resolve({
              key: image.id,
              ratio: height > 0 ? width / height : DEFAULT_ASPECT_RATIO,
            });
          },
          () => resolve({ key: image.id, ratio: DEFAULT_ASPECT_RATIO })
        );
      });

    (async () => {
      const ratios = await Promise.all(images.map(readAspectRatio));
      if (cancelled) return;

      setImageAspectRatios((prev) => {
        const next = { ...prev };
        for (const entry of ratios) next[entry.key] = entry.ratio;
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [hasImages, images]);

  useEffect(() => {
    const initialVirtualIndex = canLoop ? baseSectionStartIndex : 0;
    setActiveImageIndex(0);
    setVirtualIndex(initialVirtualIndex);

    if (!hasImages) return;
    if (containerWidth <= 0) return;

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({
        offset: initialVirtualIndex * containerWidth,
        animated: false,
      });
    });
  }, [baseSectionStartIndex, canLoop, containerWidth, hasImages, images]);

  useEffect(() => {
    if (!hasImages) return;
    if (containerWidth <= 0) return;
    flatListRef.current?.scrollToOffset({
      offset: virtualIndex * containerWidth,
      animated: false,
    });
  }, [containerWidth, hasImages]);

  const activeAspectRatio = hasImages
    ? imageAspectRatios[images[activeImageIndex]?.id] || DEFAULT_ASPECT_RATIO
    : DEFAULT_ASPECT_RATIO;

  const computedHeight = Math.min(520, Math.max(240, containerWidth / activeAspectRatio));
  const containerHeight = typeof height === "number" ? height : computedHeight;

  const renderImageItem = useCallback(({ item }: { item: ProductImage }) => {
    return (
      <View style={[styles.imageSlide, { width: containerWidth, height: containerHeight }]}>
        <Image
          source={{ uri: getImageUri(item) }}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </View>
    );
  }, [containerHeight, containerWidth]);

  const updateIndices = useCallback(
    (candidateIndex: number) => {
      const safeIndex = Math.max(0, Math.min(candidateIndex, carouselImages.length - 1));
      const normalizedIndex = resolveOriginalIndex(safeIndex);
      const stableVirtualIndex = recenterIfNeeded(safeIndex);

      setVirtualIndex(stableVirtualIndex);
      setActiveImageIndex(normalizedIndex);
    },
    [carouselImages.length, recenterIfNeeded, resolveOriginalIndex]
  );

  const previewIndices = useCallback(
    (candidateIndex: number) => {
      const safeIndex = Math.max(0, Math.min(candidateIndex, carouselImages.length - 1));
      const normalizedIndex = resolveOriginalIndex(safeIndex);
      setVirtualIndex(safeIndex);
      setActiveImageIndex(normalizedIndex);
    },
    [carouselImages.length, resolveOriginalIndex]
  );

  const scrollToVirtualIndex = useCallback(
    (nextVirtualIndex: number, animated: boolean) => {
      if (!flatListRef.current || carouselImages.length === 0) return;

      flatListRef.current.scrollToOffset({
        offset: nextVirtualIndex * containerWidth,
        animated,
      });

      if (!animated) {
        updateIndices(nextVirtualIndex);
      }
    },
    [carouselImages.length, containerWidth, updateIndices]
  );

  const getNearestVirtualIndex = useCallback(
    (targetOriginalIndex: number) => {
      if (!canLoop) return targetOriginalIndex;

      const candidates = [
        targetOriginalIndex,
        targetOriginalIndex + images.length,
        targetOriginalIndex + images.length * 2,
      ];

      return candidates.reduce((closest, candidate) => {
        const currentDistance = Math.abs(candidate - virtualIndex);
        const closestDistance = Math.abs(closest - virtualIndex);
        return currentDistance < closestDistance ? candidate : closest;
      }, candidates[0]);
    },
    [canLoop, images.length, virtualIndex]
  );

  const handleMomentumScrollEnd = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const safeWidth = containerWidth > 0 ? containerWidth : Dimensions.get("window").width;
      const nextVirtualIndex = Math.round(offsetX / safeWidth);
      updateIndices(nextVirtualIndex);
    },
    [containerWidth, updateIndices]
  );

  const handleScroll = useCallback(
    (event: any) => {
      const safeWidth = containerWidth > 0 ? containerWidth : Dimensions.get("window").width;
      if (safeWidth <= 0) return;
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextVirtualIndex = Math.round(offsetX / safeWidth);
      if (nextVirtualIndex !== virtualIndex) {
        previewIndices(nextVirtualIndex);
      }
    },
    [containerWidth, previewIndices, virtualIndex]
  );

  const handleNext = useCallback(() => {
    if (!canLoop) return;
    const nextVirtualIndex = virtualIndex + 1;
    previewIndices(nextVirtualIndex);
    scrollToVirtualIndex(nextVirtualIndex, true);
  }, [canLoop, previewIndices, scrollToVirtualIndex, virtualIndex]);

  const handlePrevious = useCallback(() => {
    if (!canLoop) return;
    const nextVirtualIndex = virtualIndex - 1;
    previewIndices(nextVirtualIndex);
    scrollToVirtualIndex(nextVirtualIndex, true);
  }, [canLoop, previewIndices, scrollToVirtualIndex, virtualIndex]);

  const handleDotPress = useCallback(
    (targetOriginalIndex: number) => {
      const targetVirtualIndex = getNearestVirtualIndex(targetOriginalIndex);
      previewIndices(targetVirtualIndex);
      scrollToVirtualIndex(targetVirtualIndex, true);
    },
    [getNearestVirtualIndex, previewIndices, scrollToVirtualIndex]
  );

  const keyExtractor = useCallback((item: ProductImage, index: number) => {
    return `${item.id}-${index}`;
  }, []);

  const getItemLayout = useCallback((_: ArrayLike<ProductImage> | null | undefined, index: number) => {
    return {
      length: containerWidth,
      offset: containerWidth * index,
      index,
    };
  }, [containerWidth]);

  if (!hasImages) {
    return (
      <View
        style={[
          styles.imageContainer,
          styles.noImageContainer,
          { backgroundColor: colors.border, height: containerHeight },
        ]}
        onLayout={(e) => {
          const nextWidth = e.nativeEvent.layout.width;
          if (nextWidth > 0 && Math.abs(nextWidth - containerWidth) > 1) {
            setContainerWidth(nextWidth);
          }
        }}
      >
        <Image
          source={{ uri: FALLBACK_IMAGE_URI }}
          style={styles.fullImage}
          resizeMode="contain"
        />
        <Text style={[styles.noImageText, { color: colors.textLight }]}>لا توجد صور</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.imageContainer, { height: containerHeight }]}
      onLayout={(e) => {
        const nextWidth = e.nativeEvent.layout.width;
        if (nextWidth > 0 && Math.abs(nextWidth - containerWidth) > 1) {
          setContainerWidth(nextWidth);
        }
      }}
    >
      <FlatList
        ref={flatListRef}
        data={carouselImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderImageItem}
        keyExtractor={keyExtractor}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        initialScrollIndex={baseSectionStartIndex}
        initialNumToRender={Math.min(Math.max(images.length, 3), carouselImages.length)}
        maxToRenderPerBatch={Math.min(Math.max(images.length, 3), carouselImages.length)}
        windowSize={5}
        removeClippedSubviews={false}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={containerWidth}
      />

      {images.length > 1 && (
        <View style={styles.indicatorContainer}>
          {[...images].reverse().map((_, reversedIndex) => {
            const originalIndex = images.length - 1 - reversedIndex;

            return (
              <TouchableOpacity
                key={originalIndex}
                onPress={() => handleDotPress(originalIndex)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.indicatorDot,
                    { backgroundColor: colors.isDark ? "#ffffff80" : colors.background + "80" },
                    activeImageIndex === originalIndex && [
                      styles.indicatorDotActive,
                      { backgroundColor: colors.primary },
                    ],
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {images.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handlePrevious}
            activeOpacity={0.7}
          >
            
          <Text style={[styles.navButtonText, { color: colors.background }]}>›</Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={ handleNext}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButtonText, { color: colors.background }]}> ‹</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  imageSlide: {
    height: "100%",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  noImageContainer: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    position: "absolute",
    fontSize: 14,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: spacing.m,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  prevButton: {
    left: spacing.m,
  },
  nextButton: {
    right: spacing.m,
  },
  navButtonText: {
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 32,
    textAlign: "center",
  },
});
