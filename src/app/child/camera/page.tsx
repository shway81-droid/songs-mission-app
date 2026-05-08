'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { DuoButton } from '@/components/ui';
import { submitAssignment, getActiveAssignments } from '@/lib/firestore';
import { compressBase64Image, formatFileSize } from '@/lib/imageUtils';
import { Assignment } from '@/types';
import toast from 'react-hot-toast';

function CameraPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isChild, hasHydrated } = useUserStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAssignmentPicker, setShowAssignmentPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 카메라 시작
  const startCamera = useCallback(async () => {
    try {
      // 이미 스트림이 있으면 중지
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 960 },
        audio: false,
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraReady(true);
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      toast.error('카메라를 사용할 수 없어요. 갤러리에서 선택해주세요.');
    }
  }, []);

  // 카메라 중지
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraReady(false);
    }
  }, []);

  useEffect(() => {
    // hydration 완료 전에는 아무것도 하지 않음
    if (!hasHydrated) return;

    if (!currentUser || !isChild()) {
      router.replace('/select');
      return;
    }

    // 활성 미션들 가져오기
    getActiveAssignments(currentUser.id).then((assignmentList) => {
      setAssignments(assignmentList);

      // URL 파라미터에서 미션 ID 확인
      const urlAssignmentId = searchParams.get('assignmentId');

      if (urlAssignmentId) {
        // URL에 미션 ID가 있으면 해당 미션 선택
        const found = assignmentList.find(a => a.id === urlAssignmentId);
        if (found) {
          setSelectedAssignment(found);
        } else if (assignmentList.length > 0) {
          setSelectedAssignment(assignmentList[0]);
        }
      } else if (assignmentList.length === 1) {
        // 미션이 하나뿐이면 자동 선택
        setSelectedAssignment(assignmentList[0]);
      } else if (assignmentList.length > 1) {
        // 미션이 여러 개면 선택 UI 표시
        setShowAssignmentPicker(true);
      }
    });

    startCamera();

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, currentUser, router, searchParams]);

  // 사진 촬영
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const data = canvas.toDataURL('image/jpeg', 0.8);
    setPhotoData(data);
    setPhotoTaken(true);
    stopCamera();
  };

  // 다시 찍기
  const retakePhoto = () => {
    setPhotoTaken(false);
    setPhotoData(null);
    startCamera();
  };

  // 갤러리에서 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      setPhotoData(data);
      setPhotoTaken(true);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // 제출하기
  const handleSubmit = async () => {
    if (!photoData || !currentUser || !selectedAssignment) {
      toast.error('제출할 수 없어요. 미션을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 이미지 압축 (1MB 이하로)
      const compressedFile = await compressBase64Image(photoData);
      console.log(`이미지 압축 완료: ${formatFileSize(compressedFile.size)}`);

      await submitAssignment(currentUser.id, selectedAssignment.id, compressedFile);
      const earnedGems = selectedAssignment.gems || 10;
      router.push(`/child/success?gems=${earnedGems}`);
    } catch (error) {
      console.error('제출 실패:', error);
      toast.error('제출에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 미션 선택
  const handleSelectAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentPicker(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 미션 선택 모달 */}
      <AnimatePresence>
        {showAssignmentPicker && assignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end"
            onClick={() => setShowAssignmentPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full bg-white rounded-t-3xl p-5 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5" />
              <h3 className="text-xl font-extrabold text-gray-800 mb-4 text-center">
                📝 어떤 미션을 제출할까요?
              </h3>
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <button
                    key={assignment.id}
                    onClick={() => handleSelectAssignment(assignment)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAssignment?.id === assignment.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-gray-700">{assignment.title}</div>
                        {assignment.description && (
                          <div className="text-sm text-gray-400 mt-1">
                            {assignment.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-blue-100 rounded-full px-2 py-1 ml-2">
                        <span className="text-sm">💎</span>
                        <span className="text-blue-600 font-bold text-xs">
                          {assignment.gems || 10}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 상단 바 */}
      <div className="py-4 px-5 flex justify-between items-center">
        <button
          onClick={() => {
            stopCamera();
            router.back();
          }}
          className="text-white text-sm font-bold"
        >
          ← 취소
        </button>
        <div className="text-white text-base font-extrabold">📷 사진 촬영</div>
        <div className="w-10" />
      </div>

      {/* 선택된 미션 표시 */}
      {selectedAssignment && (
        <div className="px-5 mb-2">
          <button
            onClick={() => assignments.length > 1 && setShowAssignmentPicker(true)}
            className="w-full bg-white/10 rounded-xl p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <span className="text-white font-bold text-sm">{selectedAssignment.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-blue-500/30 rounded-full px-2 py-1">
                <span className="text-xs">💎</span>
                <span className="text-white font-bold text-xs">{selectedAssignment.gems || 10}</span>
              </div>
              {assignments.length > 1 && (
                <span className="text-white/50 text-xs">변경 ▼</span>
              )}
            </div>
          </button>
        </div>
      )}

      {/* 카메라 뷰파인더 / 촬영된 사진 */}
      <div className="flex-1 relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!photoTaken ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-[90%] max-w-[320px] aspect-[3/4] relative"
            >
              {/* 비디오 미리보기 */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              />

              {/* 가이드 프레임 */}
              <div className="absolute inset-0 border-[3px] border-dashed border-white/60 rounded-2xl bg-white/5">
                {/* 코너 가이드 */}
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                  <div
                    key={corner}
                    className="absolute w-6 h-6"
                    style={{
                      borderColor: '#58CC02',
                      borderWidth: '3px',
                      borderStyle: 'solid',
                      borderRadius: corner.includes('top')
                        ? corner.includes('left')
                          ? '8px 0 0 0'
                          : '0 8px 0 0'
                        : corner.includes('left')
                          ? '0 0 0 8px'
                          : '0 0 8px 0',
                      borderRight: corner.includes('left') ? 'none' : undefined,
                      borderLeft: corner.includes('right') ? 'none' : undefined,
                      borderBottom: corner.includes('top') ? 'none' : undefined,
                      borderTop: corner.includes('bottom') ? 'none' : undefined,
                      top: corner.includes('top') ? '-2px' : undefined,
                      bottom: corner.includes('bottom') ? '-2px' : undefined,
                      left: corner.includes('left') ? '-2px' : undefined,
                      right: corner.includes('right') ? '-2px' : undefined,
                    }}
                  />
                ))}

                {/* 가이드 텍스트 (카메라가 없거나 로딩 중일 때) */}
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
                    <div className="text-[40px] mb-3">📓</div>
                    <div className="text-sm font-bold text-center">
                      공책/문제집을
                      <br />이 영역 안에 맞춰요
                    </div>
                  </div>
                )}
              </div>

              {/* 안내 문구 */}
              <div className="absolute -bottom-16 left-0 right-0 text-center">
                <span className="bg-white/20 py-2 px-4 rounded-full text-white text-[13px] font-semibold">
                  ⚠️ 얼굴 촬영 금지 · 글씨가 보이게 촬영
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-[90%] max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden"
            >
              {photoData && (
                <img
                  src={photoData}
                  alt="촬영된 사진"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-6">
                <div className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  사진 촬영 완료!
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 캔버스 (숨김) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 파일 입력 (숨김) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 하단 컨트롤 */}
      <div className="py-5 pb-10 px-5 bg-black/80">
        {!photoTaken ? (
          <div className="flex justify-center items-center gap-6">
            {/* 갤러리 버튼 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"
            >
              <span className="text-2xl">🖼️</span>
            </button>

            {/* 촬영 버튼 */}
            <button
              onClick={takePhoto}
              disabled={!cameraReady}
              className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center border-4 border-white/30"
            >
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <span className="text-3xl">📷</span>
              </div>
            </button>

            {/* 플래시 버튼 (기능 미구현) */}
            <button className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="flex-1">
              <DuoButton color="gray" onClick={retakePhoto}>
                <span className="text-gray-500">🔄 다시 찍기</span>
              </DuoButton>
            </div>
            <div className="flex-[2]">
              <DuoButton onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? '제출 중...' : '✓ 제출하기'}
              </DuoButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CameraPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-bold">로딩 중...</div>
      </div>
    }>
      <CameraPageContent />
    </Suspense>
  );
}
