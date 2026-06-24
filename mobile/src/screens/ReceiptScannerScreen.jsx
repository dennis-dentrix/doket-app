import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Dimensions, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FRAME_WIDTH = SCREEN_WIDTH * 0.82;
const FRAME_HEIGHT = FRAME_WIDTH * 1.33;
const OVERLAY_COLOR = 'rgba(0,0,0,0.62)';
const SIDE_WIDTH = (SCREEN_WIDTH - FRAME_WIDTH) / 2;
const FRAME_TOP = (SCREEN_HEIGHT - FRAME_HEIGHT) / 2 - 40;
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

export default function ReceiptScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState(null); // captured image awaiting confirm
  const cameraRef = useRef(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_HEIGHT - 2],
  });

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.88,
        base64: false,
        shutterSound: false, // suppress shutter sound where OS allows
      });
      setPreviewUri(photo.uri);
    } catch {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.images,
      quality: 0.88,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const handleUsePhoto = () => {
    navigation.navigate('ReceiptDetail', { imageUri: previewUri });
  };

  const handleRetake = () => setPreviewUri(null);

  // ── Permission states ──────────────────────────────────────────────────

  if (!permission) return <View style={styles.permissionContainer} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Ionicons name="camera-outline" size={56} color="rgba(255,255,255,0.5)" style={{ marginBottom: 16 }} />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionSub}>Allow camera access to scan receipts.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permissionBack} onPress={() => navigation.goBack()}>
          <Text style={styles.permissionBackText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Confirm-preview step ───────────────────────────────────────────────

  if (previewUri) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />

        {/* Dark gradient bottom */}
        <View style={styles.previewGradient} />

        {/* Header */}
        <SafeAreaView style={styles.header} edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={handleRetake} style={styles.headerBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Review Photo</Text>
            <View style={styles.headerBtn} />
          </View>
        </SafeAreaView>

        {/* Bottom confirm / retake */}
        <SafeAreaView style={styles.previewControls} edges={['bottom']}>
          <Text style={styles.previewHint}>Does the receipt look clear?</Text>
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.usePhotoBtn} onPress={handleUsePhoto} activeOpacity={0.85}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.usePhotoBtnText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Live camera ────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Camera — mute suppresses shutter sound on Android */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        mute
      />

      {/* Overlay: top */}
      <View style={styles.overlayTop} />

      {/* Overlay: sides + frame */}
      <View style={styles.overlayMiddleRow}>
        <View style={styles.overlaySide} />
        <View style={styles.frame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
        </View>
        <View style={styles.overlaySide} />
      </View>

      {/* Overlay: bottom */}
      <View style={styles.overlayBottom} />

      {/* Hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>Position receipt within the frame</Text>
      </View>

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.headerBtn}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Receipt</Text>
          <TouchableOpacity onPress={() => setTorch(t => !t)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.headerBtn}>
            <Ionicons name={torch ? 'flash' : 'flash-outline'} size={24} color={torch ? '#FF6B35' : '#fff'} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom controls */}
      <SafeAreaView style={styles.bottomControls} edges={['bottom']}>
        <TouchableOpacity style={styles.galleryBtn} onPress={handlePickFromGallery} activeOpacity={0.7}>
          <Ionicons name="image-outline" size={18} color="#FF6B35" />
          <Text style={styles.galleryBtnText}>Pick from Gallery</Text>
        </TouchableOpacity>
        <View style={styles.captureWrapper}>
          <PulseRing />
          <TouchableOpacity
            style={[styles.captureBtn, isCapturing && { opacity: 0.7 }]}
            onPress={handleCapture}
            disabled={isCapturing}
            activeOpacity={0.85}
          >
            <Ionicons name="camera" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function PulseRing() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse }] }]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, height: FRAME_TOP, backgroundColor: OVERLAY_COLOR },
  overlayMiddleRow: { position: 'absolute', top: FRAME_TOP, left: 0, right: 0, height: FRAME_HEIGHT, flexDirection: 'row' },
  overlaySide: { width: SIDE_WIDTH, backgroundColor: OVERLAY_COLOR },
  overlayBottom: { position: 'absolute', top: FRAME_TOP + FRAME_HEIGHT, left: 0, right: 0, bottom: 0, backgroundColor: OVERLAY_COLOR },

  frame: { width: FRAME_WIDTH, height: FRAME_HEIGHT, position: 'relative', overflow: 'hidden' },

  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: '#FF6B35' },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 6 },

  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4,
  },

  hint: {
    position: 'absolute', top: FRAME_TOP + FRAME_HEIGHT + 20, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999,
  },
  hintText: { color: '#fff', fontSize: 13, fontWeight: '500' },

  header: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },

  bottomControls: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 32, paddingTop: 16, gap: 20 },
  galleryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8 },
  galleryBtnText: { color: '#FF6B35', fontSize: 14, fontWeight: '600' },
  captureWrapper: { width: 84, height: 84, justifyContent: 'center', alignItems: 'center' },
  pulseRing: { position: 'absolute', width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: 'rgba(255,107,53,0.4)' },
  captureBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FF6B35',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },

  // Confirm-preview step
  previewGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 240, backgroundColor: 'rgba(0,0,0,0.55)' },
  previewControls: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 32, paddingHorizontal: 24 },
  previewHint: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500', marginBottom: 20 },
  previewButtons: { flexDirection: 'row', gap: 16, width: '100%' },
  retakeBtn: {
    flex: 1, height: 52, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  retakeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  usePhotoBtn: {
    flex: 1, height: 52, borderRadius: 14, backgroundColor: '#FF6B35',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  usePhotoBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Permission
  permissionContainer: { flex: 1, backgroundColor: '#0E141A', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  permissionTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
  permissionSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 },
  permissionBtn: { backgroundColor: '#FF6B35', borderRadius: 999, paddingHorizontal: 32, paddingVertical: 14, marginBottom: 12 },
  permissionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  permissionBack: { paddingVertical: 10 },
  permissionBackText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
});
