import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProductImage } from "../types";
import { useThemeColors } from "../../../shared/theme/colors";
import { spacing } from "../../../shared/theme/spacing";

const { width: screenWidth } = Dimensions.get("window");
const FALLBACK_IMAGE_URI = "https://via.placeholder.com/600x400?text=No+Image";
const DEFAULT_ASPECT_RATIO = 1.5;
const LOOP_BLOCK_COUNT = 3;

interface ProductImageCarouselProps {
  images: ProductImage[];
}

const getImageUri = (image?: ProductImage) => image?.image_url || FALLBACK_IMAGE_URI;

export const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images }) => {
  const colors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [virtualIndex, setVirtualIndex] = useState(0);
  const [imageAspectRatios, setImageAspectRatios] = useState<Record<string, number>>({});

  const hasImages = images.length > 0;
  const canLoop = images.length > 1;
  const baseSectionStartIndex = canLoop ? images.length : 0;

  const carouselImages = useMemo(() => {
    if (!canLoop) return images;
    return Array.from({ length: LOOP_BLOCK_COUNT }, () => images).flat();
  }, [canLoop, images]);

  const resolveOriginalIndex = useCallback(
    (candidateIndex: number) => {
      if (images.length === 0) return 0;
      if (!canLoop) return Math.max(0, Math.min(candidateIndex, images.length - 1));
      return ((candidateIndex % images.length) + images.length) % images.length;
    },
    [canLoop, images.length]
  );

  const scrollToVirtualIndex = useCallback((nextVirtualIndex: number, animated: boolean) => {
    scrollViewRef.current?.scrollTo({
      x: nextVirtualIndex * screenWidth,
      y: 0,
      animated,
    });
  }, []);

  const recenterIfNeeded = useCallback(
    (candidateIndex: number) => {
      if (!canLoop) return candidateIndex;

      if (candidateIndex < images.length || candidateIndex >= images.length * 2) {
        const normalizedIndex = resolveOriginalIndex(candidateIndex);
        const recenteredIndex = baseSectionStartIndex + normalizedIndex;

        requestAnimationFrame(() => {
          scrollToVirtualIndex(recenteredIndex, false);
        });

        return recenteredIndex;
      }

      return candidateIndex;
    },
    [baseSectionStartIndex, canLoop, images.length, resolveOriginalIndex, scrollToVirtualIndex]
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

    requestAnimationFrame(() => {
      scrollToVirtualIndex(initialVirtualIndex, false);
    });
  }, [baseSectionStartIndex, canLoop, hasImages, images, scrollToVirtualIndex]);

  const activeAspectRatio = hasImages
    ? imageAspectRatios[images[activeImageIndex]?.id] || DEFAULT_ASPECT_RATIO
    : DEFAULT_ASPECT_RATIO;

  const containerHeight = Math.min(
    520,
    Math.max(240, screenWidth / activeAspectRatio)
  );

  const renderImageItem = useCallback((item: ProductImage, index: number) => {
    return (
      <View key={`${item.id}-${index}`} style={[styles.imageSlide, { width: screenWidth }]}>
        <Image
          source={{ uri: getImageUri(item) }}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </View>
    );
  }, []);

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
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextVirtualIndex = Math.round(offsetX / screenWidth);
      updateIndices(nextVirtualIndex);
    },
    [updateIndices]
  );

  const handleNext = useCallback(() => {
    if (!canLoop) return;
    scrollToVirtualIndex(virtualIndex + 1, true);
  }, [canLoop, scrollToVirtualIndex, virtualIndex]);

  const handlePrevious = useCallback(() => {
    if (!canLoop) return;
    scrollToVirtualIndex(virtualIndex - 1, true);
  }, [canLoop, scrollToVirtualIndex, virtualIndex]);

  const handleDotPress = useCallback(
    (targetOriginalIndex: number) => {
      const targetVirtualIndex = getNearestVirtualIndex(targetOriginalIndex);
      setActiveImageIndex(targetOriginalIndex);
      setVirtualIndex(targetVirtualIndex);
      scrollToVirtualIndex(targetVirtualIndex, true);
    },
    [getNearestVirtualIndex, scrollToVirtualIndex]
  );

  if (!hasImages) {
    return (
      <View style={[styles.imageContainer, styles.noImageContainer, { backgroundColor: colors.border }]}>
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
    <View style={[styles.imageContainer, { height: containerHeight }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={screenWidth}
        contentOffset={{ x: baseSectionStartIndex * screenWidth, y: 0 }}
        directionalLockEnabled
        bounces={false}
        overScrollMode="never"
      >
        {carouselImages.map((item, index) => renderImageItem(item, index))}
      </ScrollView>

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
                    { backgroundColor: colors.background + "80" },
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
        <View style={styles.imageCounter}>
          <Text style={[styles.imageCounterText, { color: colors.background }]}>
            {activeImageIndex + 1} / {images.length}
          </Text>
        </View>
      )}

      {images.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            
            <Text style={[styles.navButtonText, { color: colors.background }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={handlePrevious}
            activeOpacity={0.7}
          >
            <Text style={[styles.navButtonText, { color: colors.background }]}>‹</Text>
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
  imageCounter: {
    position: "absolute",
    top: spacing.m,
    right: spacing.m,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.s,
    zIndex: 10,
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: "bold",
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
