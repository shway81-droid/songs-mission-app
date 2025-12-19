import React, { useState } from 'react';

// ============================================================
// 듀오링고 스타일 - 학생 반복 과제 사진 제출 앱 전체 와이어프레임
// ============================================================

// 공통 스타일 상수
const COLORS = {
  primary: '#58CC02',      // 듀오링고 그린
  primaryDark: '#4CAD00',  // 버튼 그림자용
  secondary: '#1CB0F6',    // 블루
  background: '#235390',   // 다크 블루 배경
  backgroundDark: '#1A4572',
  streak: '#FF9600',       // 오렌지 (스트릭)
  streakDark: '#D98000',
  heart: '#FF4B4B',        // 레드
  white: '#FFFFFF',
  gray: '#E5E5E5',
  grayDark: '#AFAFAF',
  text: '#3C3C3C',
  textLight: '#777777',
  rejected: '#FF4B4B',
  pending: '#FFC800'
};

const FONTS = {
  main: "'Nunito', 'Noto Sans KR', -apple-system, sans-serif"
};

// ============================================================
// 공통 컴포넌트
// ============================================================

// 상단 헤더 바 (스트릭, 젬, 하트)
const TopHeader = ({ streak = 5, gems = 450, hearts = 5 }) => (
  <div style={{
    background: COLORS.backgroundDark,
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: COLORS.streak,
        fontWeight: '800',
        fontSize: '17px'
      }}>
        <span style={{ fontSize: '22px' }}>🔥</span>
        {streak}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: COLORS.secondary,
        fontWeight: '800',
        fontSize: '17px'
      }}>
        <span style={{ fontSize: '22px' }}>💎</span>
        {gems}
      </div>
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: COLORS.heart,
      fontWeight: '800',
      fontSize: '17px'
    }}>
      <span style={{ fontSize: '22px' }}>❤️</span>
      {hearts}
    </div>
  </div>
);

// 3D 스타일 버튼
const DuoButton = ({ 
  children, 
  onClick, 
  color = COLORS.primary, 
  shadowColor = COLORS.primaryDark,
  disabled = false,
  fullWidth = true,
  size = 'large'
}) => {
  const [pressed, setPressed] = useState(false);
  
  const padding = size === 'large' ? '16px 24px' : '12px 16px';
  const fontSize = size === 'large' ? '17px' : '15px';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding,
        borderRadius: '16px',
        border: 'none',
        background: disabled ? COLORS.gray : color,
        color: disabled ? COLORS.grayDark : COLORS.white,
        fontSize,
        fontWeight: '800',
        fontFamily: FONTS.main,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: pressed || disabled ? 'none' : `0 4px 0 ${shadowColor}`,
        transform: pressed ? 'translateY(4px)' : 'translateY(0)',
        transition: 'all 0.1s ease',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      {children}
    </button>
  );
};

// 캐릭터 말풍선
const CharacterBubble = ({ message, character = '🦉' }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px'
  }}>
    <div style={{
      width: '64px',
      height: '64px',
      background: COLORS.primary,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      border: `4px solid ${COLORS.primaryDark}`,
      boxShadow: `0 4px 0 ${COLORS.primaryDark}`,
      flexShrink: 0
    }}>
      {character}
    </div>
    <div style={{
      background: COLORS.white,
      borderRadius: '20px',
      borderBottomLeftRadius: '4px',
      padding: '14px 18px',
      boxShadow: '0 4px 0 #E5E5E5',
      maxWidth: '240px'
    }}>
      <div style={{
        fontWeight: '700',
        color: COLORS.text,
        fontSize: '15px',
        lineHeight: '1.5',
        fontFamily: FONTS.main
      }}>
        {message}
      </div>
    </div>
  </div>
);

// 진행률 바
const ProgressBar = ({ current, total, label }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        fontSize: '13px',
        fontWeight: '700',
        color: COLORS.textLight,
        fontFamily: FONTS.main
      }}>
        <span>{label}</span>
        <span>{current}/{total}</span>
      </div>
    )}
    <div style={{
      height: '14px',
      background: COLORS.gray,
      borderRadius: '7px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: `${(current / total) * 100}%`,
        height: '100%',
        background: `linear-gradient(90deg, ${COLORS.primary} 0%, #78E100 100%)`,
        borderRadius: '7px',
        transition: 'width 0.5s ease'
      }} />
    </div>
  </div>
);


// ============================================================
// 학생 화면들
// ============================================================

// 1. 학생 홈 화면
const StudentHome = ({ onNavigate, streak = 5, hasRejected = false }) => {
  const weekProgress = { done: 5, total: 7 };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.background,
      fontFamily: FONTS.main
    }}>
      <TopHeader streak={streak} />
      
      <div style={{ padding: '20px' }}>
        {/* 캐릭터 인사 */}
        <CharacterBubble 
          message={hasRejected ? 
            "앗! 어제 과제가 반려됐어 😅\n다시 제출해줘!" : 
            `안녕! 오늘도 화이팅! 🎉\n${streak}일 연속 제출 중이야!`
          }
        />
        
        {/* 반려 알림 카드 (있을 경우) */}
        {hasRejected && (
          <div style={{
            background: 'linear-gradient(135deg, #FF4B4B 0%, #FF6B6B 100%)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 0 #CC3D3D'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: COLORS.white
            }}>
              <span style={{ fontSize: '28px' }}>🔴</span>
              <div>
                <div style={{ fontWeight: '800', fontSize: '15px' }}>반려된 과제가 있어요!</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>📸 사진이 흐려요 - 다시 찍어주세요</div>
              </div>
            </div>
            <DuoButton 
              onClick={() => onNavigate('camera')}
              color="#FFFFFF"
              shadowColor="#E5E5E5"
              size="small"
              style={{ marginTop: '12px' }}
            >
              <span style={{ color: COLORS.heart }}>다시 제출하기</span>
            </DuoButton>
          </div>
        )}
        
        {/* 오늘의 과제 카드 */}
        <div style={{
          background: COLORS.white,
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '16px',
          boxShadow: '0 4px 0 rgba(0,0,0,0.1)'
        }}>
          <div style={{
            background: COLORS.primary,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>📝</span>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: '700' }}>
                오늘의 미션
              </div>
              <div style={{ color: COLORS.white, fontSize: '17px', fontWeight: '800' }}>
                과제 제출하기
              </div>
            </div>
          </div>
          
          <div style={{ padding: '18px' }}>
            <div style={{
              background: '#F7F7F7',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '14px',
              border: '2px solid #E5E5E5'
            }}>
              <div style={{ 
                fontWeight: '800', 
                color: COLORS.text,
                marginBottom: '6px',
                fontSize: '16px'
              }}>
                수학 문제집 42~45쪽
              </div>
              <div style={{ 
                color: COLORS.textLight,
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                분수의 덧셈과 뺄셈 문제를 풀고 사진으로 제출해요
              </div>
            </div>

            <ProgressBar 
              current={weekProgress.done} 
              total={weekProgress.total} 
              label="이번 주 진행률"
            />

            <DuoButton onClick={() => onNavigate('taskDetail')}>
              📷 제출하러 가기
            </DuoButton>
          </div>
        </div>
        
        {/* 연속 제출 스트릭 카드 */}
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.streak} 0%, #FFB800 100%)`,
          borderRadius: '16px',
          padding: '18px',
          boxShadow: `0 4px 0 ${COLORS.streakDark}`,
          color: COLORS.white,
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '14px'
          }}>
            <span style={{ fontSize: '40px' }}>🔥</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', opacity: 0.9 }}>연속 제출</div>
              <div style={{ fontSize: '32px', fontWeight: '900' }}>{streak}일</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1,2,3,4,5,6,7].map((day) => (
              <div key={day} style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                background: day <= streak ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)'
              }} />
            ))}
          </div>
          <div style={{
            marginTop: '10px',
            fontSize: '13px',
            fontWeight: '700',
            opacity: 0.9
          }}>
            {7 - streak > 0 ? `${7 - streak}일 더 하면 주간 완료! 🎁` : '이번 주 완벽 달성! 🏆'}
          </div>
        </div>
        
        {/* 달력 버튼 */}
        <div 
          onClick={() => onNavigate('calendar')}
          style={{
            background: COLORS.white,
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>📅</span>
            <div>
              <div style={{ fontWeight: '800', color: COLORS.text, fontSize: '15px' }}>내 기록 보기</div>
              <div style={{ fontSize: '13px', color: COLORS.textLight }}>달력에서 제출 현황을 확인해요</div>
            </div>
          </div>
          <span style={{ fontSize: '20px', color: COLORS.grayDark }}>→</span>
        </div>
      </div>
    </div>
  );
};


// 2. 과제 상세 화면
const TaskDetail = ({ onNavigate }) => (
  <div style={{
    minHeight: '100vh',
    background: COLORS.background,
    fontFamily: FONTS.main
  }}>
    <TopHeader />
    
    <div style={{ padding: '20px' }}>
      {/* 뒤로가기 */}
      <div 
        onClick={() => onNavigate('home')}
        style={{
          color: COLORS.white,
          fontSize: '14px',
          fontWeight: '700',
          marginBottom: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        ← 홈으로
      </div>
      
      <CharacterBubble message="과제 내용을 잘 확인하고 사진을 찍어줘! 📷" />
      
      {/* 과제 상세 카드 */}
      <div style={{
        background: COLORS.white,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 0 rgba(0,0,0,0.1)'
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.secondary} 0%, #3BC4F8 100%)`,
          padding: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '56px' }}>📐</span>
          <div style={{ 
            color: COLORS.white, 
            fontSize: '20px', 
            fontWeight: '800',
            marginTop: '8px'
          }}>
            수학
          </div>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{
            fontSize: '22px',
            fontWeight: '800',
            color: COLORS.text,
            marginBottom: '12px'
          }}>
            수학 문제집 42~45쪽
          </div>
          
          <div style={{
            background: '#F7F7F7',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '15px',
              color: COLORS.text,
              lineHeight: '1.6'
            }}>
              <strong>📌 해야 할 것:</strong><br/>
              분수의 덧셈과 뺄셈 문제를 모두 풀어요
              <br/><br/>
              <strong>📸 제출 방법:</strong><br/>
              풀이가 잘 보이도록 사진을 찍어 제출해요
            </div>
          </div>
          
          {/* 주의사항 */}
          <div style={{
            background: '#FFF9E6',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '20px',
            border: '2px solid #FFE082'
          }}>
            <div style={{ 
              fontSize: '14px', 
              color: '#9A7B00',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>사진 촬영 시 주의사항</span>
            </div>
            <ul style={{
              margin: '8px 0 0 0',
              paddingLeft: '20px',
              fontSize: '13px',
              color: '#9A7B00',
              lineHeight: '1.6'
            }}>
              <li>얼굴이 나오지 않게 찍어요</li>
              <li>글씨가 잘 보이게 찍어요</li>
              <li>밝은 곳에서 촬영해요</li>
            </ul>
          </div>
          
          <DuoButton onClick={() => onNavigate('camera')}>
            📷 사진 찍으러 가기
          </DuoButton>
        </div>
      </div>
    </div>
  </div>
);


// 3. 카메라/사진 제출 화면
const CameraScreen = ({ onNavigate }) => {
  const [photoTaken, setPhotoTaken] = useState(false);
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      fontFamily: FONTS.main,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 상단 바 */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div 
          onClick={() => onNavigate('taskDetail')}
          style={{
            color: COLORS.white,
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          ← 취소
        </div>
        <div style={{
          color: COLORS.white,
          fontSize: '16px',
          fontWeight: '800'
        }}>
          📷 사진 촬영
        </div>
        <div style={{ width: '40px' }} />
      </div>
      
      {/* 카메라 뷰파인더 영역 */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!photoTaken ? (
          <>
            {/* 가이드 프레임 */}
            <div style={{
              width: '90%',
              maxWidth: '320px',
              aspectRatio: '3/4',
              border: '3px dashed rgba(255,255,255,0.6)',
              borderRadius: '16px',
              position: 'relative',
              background: 'rgba(255,255,255,0.05)'
            }}>
              {/* 코너 가이드 */}
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                <div key={corner} style={{
                  position: 'absolute',
                  width: '24px',
                  height: '24px',
                  border: `3px solid ${COLORS.primary}`,
                  borderRadius: corner.includes('top') ? 
                    (corner.includes('left') ? '8px 0 0 0' : '0 8px 0 0') :
                    (corner.includes('left') ? '0 0 0 8px' : '0 0 8px 0'),
                  borderRight: corner.includes('left') ? 'none' : undefined,
                  borderLeft: corner.includes('right') ? 'none' : undefined,
                  borderBottom: corner.includes('top') ? 'none' : undefined,
                  borderTop: corner.includes('bottom') ? 'none' : undefined,
                  top: corner.includes('top') ? '-2px' : undefined,
                  bottom: corner.includes('bottom') ? '-2px' : undefined,
                  left: corner.includes('left') ? '-2px' : undefined,
                  right: corner.includes('right') ? '-2px' : undefined,
                }} />
              ))}
              
              {/* 가이드 텍스트 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.7)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📓</div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>
                  공책/문제집을<br/>이 영역 안에 맞춰요
                </div>
              </div>
            </div>
            
            {/* 안내 문구 */}
            <div style={{
              position: 'absolute',
              bottom: '140px',
              left: '0',
              right: '0',
              textAlign: 'center',
              color: COLORS.white,
              fontSize: '13px',
              fontWeight: '600',
              padding: '0 20px'
            }}>
              <span style={{ 
                background: 'rgba(255,255,255,0.2)',
                padding: '8px 16px',
                borderRadius: '20px'
              }}>
                ⚠️ 얼굴 촬영 금지 · 글씨가 보이게 촬영
              </span>
            </div>
          </>
        ) : (
          /* 찍은 사진 미리보기 */
          <div style={{
            width: '90%',
            maxWidth: '320px',
            aspectRatio: '3/4',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '60px', marginBottom: '12px' }}>✓</span>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '700',
              color: COLORS.primaryDark
            }}>
              사진 촬영 완료!
            </div>
          </div>
        )}
      </div>
      
      {/* 하단 컨트롤 */}
      <div style={{
        padding: '20px',
        paddingBottom: '40px',
        background: 'rgba(0,0,0,0.8)'
      }}>
        {!photoTaken ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px'
          }}>
            {/* 갤러리 버튼 */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: '24px' }}>🖼️</span>
            </div>
            
            {/* 촬영 버튼 */}
            <div 
              onClick={() => setPhotoTaken(true)}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: COLORS.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '4px solid rgba(255,255,255,0.3)'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: COLORS.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '28px' }}>📷</span>
              </div>
            </div>
            
            {/* 플래시 버튼 */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: '24px' }}>⚡</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <DuoButton 
              onClick={() => setPhotoTaken(false)}
              color={COLORS.gray}
              shadowColor="#CDCDCD"
              fullWidth={false}
              style={{ flex: 1 }}
            >
              <span style={{ color: COLORS.text }}>🔄 다시 찍기</span>
            </DuoButton>
            <div style={{ flex: 2 }}>
              <DuoButton onClick={() => onNavigate('submitSuccess')}>
                ✓ 제출하기
              </DuoButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// 4. 제출 완료 화면
const SubmitSuccess = ({ onNavigate, newStreak = 6 }) => (
  <div style={{
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${COLORS.primary} 0%, #78E100 100%)`,
    fontFamily: FONTS.main,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center'
  }}>
    {/* 축하 애니메이션 영역 */}
    <div style={{
      fontSize: '100px',
      marginBottom: '20px',
      animation: 'bounce 0.5s ease infinite alternate'
    }}>
      🎉
    </div>
    
    <div style={{
      color: COLORS.white,
      fontSize: '32px',
      fontWeight: '900',
      marginBottom: '8px',
      textShadow: '0 4px 0 rgba(0,0,0,0.2)'
    }}>
      제출 완료!
    </div>
    
    <div style={{
      color: 'rgba(255,255,255,0.9)',
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '32px'
    }}>
      오늘도 과제를 완료했어요!
    </div>
    
    {/* 스트릭 업데이트 카드 */}
    <div style={{
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '20px',
      padding: '24px',
      backdropFilter: 'blur(10px)',
      marginBottom: '32px',
      width: '100%',
      maxWidth: '300px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '48px' }}>🔥</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ 
            color: 'rgba(255,255,255,0.85)', 
            fontSize: '14px',
            fontWeight: '700'
          }}>
            연속 제출 기록
          </div>
          <div style={{ 
            color: COLORS.white, 
            fontSize: '36px',
            fontWeight: '900'
          }}>
            {newStreak}일!
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {[1,2,3,4,5,6,7].map((day) => (
          <div key={day} style={{
            width: '32px',
            height: '8px',
            borderRadius: '4px',
            background: day <= newStreak ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)'
          }} />
        ))}
      </div>
      
      {newStreak < 7 && (
        <div style={{
          marginTop: '12px',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '700'
        }}>
          +1 🔥 내일도 도전!
        </div>
      )}
    </div>
    
    {/* 젬 획득 */}
    <div style={{
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '30px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '32px'
    }}>
      <span style={{ fontSize: '24px' }}>💎</span>
      <span style={{ 
        color: COLORS.white, 
        fontWeight: '800',
        fontSize: '18px'
      }}>
        +10 젬 획득!
      </span>
    </div>
    
    <DuoButton 
      onClick={() => onNavigate('home')}
      color={COLORS.white}
      shadowColor="#E5E5E5"
    >
      <span style={{ color: COLORS.primary }}>홈으로 돌아가기</span>
    </DuoButton>
  </div>
);


// 5. 달력 화면
const CalendarScreen = ({ onNavigate }) => {
  const today = 20;
  const calendarData = [
    { date: 1, status: 'done' },
    { date: 2, status: 'done' },
    { date: 3, status: 'done' },
    { date: 4, status: 'rejected' },
    { date: 5, status: 'done' },
    { date: 6, status: 'none' },
    { date: 7, status: 'none' },
    { date: 8, status: 'done' },
    { date: 9, status: 'done' },
    { date: 10, status: 'done' },
    { date: 11, status: 'done' },
    { date: 12, status: 'done' },
    { date: 13, status: 'none' },
    { date: 14, status: 'none' },
    { date: 15, status: 'done' },
    { date: 16, status: 'done' },
    { date: 17, status: 'done' },
    { date: 18, status: 'done' },
    { date: 19, status: 'done' },
    { date: 20, status: 'today' },
    { date: 21, status: 'future' },
    { date: 22, status: 'future' },
    { date: 23, status: 'future' },
    { date: 24, status: 'future' },
    { date: 25, status: 'future' },
    { date: 26, status: 'future' },
    { date: 27, status: 'future' },
    { date: 28, status: 'future' },
    { date: 29, status: 'future' },
    { date: 30, status: 'future' },
    { date: 31, status: 'future' },
  ];
  
  const getStatusStyle = (status) => {
    switch(status) {
      case 'done': return { bg: COLORS.primary, color: COLORS.white, icon: '⭕' };
      case 'rejected': return { bg: COLORS.rejected, color: COLORS.white, icon: '🔴' };
      case 'today': return { bg: COLORS.pending, color: COLORS.text, icon: '📝' };
      case 'none': return { bg: COLORS.gray, color: COLORS.grayDark, icon: '⚪' };
      default: return { bg: '#F5F5F5', color: '#CCC', icon: '' };
    }
  };
  
  // 주차별로 그룹화
  const firstDayOfMonth = 0; // 12월 1일 = 일요일
  const paddedCalendar = [
    ...Array(firstDayOfMonth).fill(null),
    ...calendarData
  ];
  
  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.background,
      fontFamily: FONTS.main
    }}>
      <TopHeader />
      
      <div style={{ padding: '20px' }}>
        {/* 뒤로가기 */}
        <div 
          onClick={() => onNavigate('home')}
          style={{
            color: COLORS.white,
            fontSize: '14px',
            fontWeight: '700',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
        >
          ← 홈으로
        </div>
        
        {/* 월 표시 */}
        <div style={{
          color: COLORS.white,
          fontSize: '24px',
          fontWeight: '800',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>📅</span>
          12월 2024
        </div>
        
        {/* 통계 요약 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: COLORS.white,
            borderRadius: '12px',
            padding: '14px',
            textAlign: 'center',
            boxShadow: '0 2px 0 rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.primary }}>15</div>
            <div style={{ fontSize: '12px', color: COLORS.textLight, fontWeight: '600' }}>제출 ⭕</div>
          </div>
          <div style={{
            background: COLORS.white,
            borderRadius: '12px',
            padding: '14px',
            textAlign: 'center',
            boxShadow: '0 2px 0 rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.grayDark }}>2</div>
            <div style={{ fontSize: '12px', color: COLORS.textLight, fontWeight: '600' }}>미제출 ⚪</div>
          </div>
          <div style={{
            background: COLORS.white,
            borderRadius: '12px',
            padding: '14px',
            textAlign: 'center',
            boxShadow: '0 2px 0 rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.rejected }}>1</div>
            <div style={{ fontSize: '12px', color: COLORS.textLight, fontWeight: '600' }}>반려 🔴</div>
          </div>
        </div>
        
        {/* 달력 */}
        <div style={{
          background: COLORS.white,
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 4px 0 rgba(0,0,0,0.1)'
        }}>
          {/* 요일 헤더 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '8px'
          }}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <div key={i} style={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: i === 0 ? COLORS.rejected : (i === 6 ? COLORS.secondary : COLORS.textLight),
                padding: '8px 0'
              }}>
                {day}
              </div>
            ))}
          </div>
          
          {/* 날짜 그리드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px'
          }}>
            {paddedCalendar.map((item, i) => {
              if (!item) return <div key={i} />;
              const style = getStatusStyle(item.status);
              return (
                <div key={i} style={{
                  aspectRatio: '1',
                  borderRadius: '10px',
                  background: style.bg,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: style.color,
                  border: item.date === today ? `2px solid ${COLORS.primary}` : 'none',
                  position: 'relative'
                }}>
                  {item.status === 'done' || item.status === 'rejected' ? (
                    <span style={{ fontSize: '16px' }}>{style.icon}</span>
                  ) : (
                    item.date
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 범례 */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px'
        }}>
          {[
            { icon: '⭕', label: '제출', color: COLORS.primary },
            { icon: '⚪', label: '미제출', color: COLORS.grayDark },
            { icon: '🔴', label: '반려', color: COLORS.rejected }
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: COLORS.white,
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// 6. 반려 알림 화면 (학생)
const RejectedNotice = ({ onNavigate }) => (
  <div style={{
    minHeight: '100vh',
    background: COLORS.background,
    fontFamily: FONTS.main
  }}>
    <TopHeader />
    
    <div style={{ padding: '20px' }}>
      {/* 캐릭터 걱정 표정 */}
      <CharacterBubble 
        message="앗! 선생님이 과제를 다시 확인해달라고 했어 😅"
        character="😰"
      />
      
      {/* 반려 상세 카드 */}
      <div style={{
        background: COLORS.white,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.rejected} 0%, #FF6B6B 100%)`,
          padding: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '48px' }}>🔴</span>
          <div style={{
            color: COLORS.white,
            fontSize: '20px',
            fontWeight: '800',
            marginTop: '8px'
          }}>
            과제가 반려되었어요
          </div>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{
            background: '#FFF5F5',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            border: '2px solid #FFCDD2'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '28px' }}>📸</span>
              <div>
                <div style={{ fontWeight: '800', color: COLORS.text, fontSize: '16px' }}>
                  반려 사유
                </div>
                <div style={{ color: COLORS.rejected, fontWeight: '700', fontSize: '15px' }}>
                  사진이 흐려요
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '14px',
              color: COLORS.textLight,
              lineHeight: '1.5'
            }}>
              사진의 글씨가 잘 안 보여요.<br/>
              밝은 곳에서 다시 찍어주세요!
            </div>
          </div>
          
          <div style={{
            background: '#F7F7F7',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', color: COLORS.text, fontWeight: '700' }}>
              📝 원래 과제: 수학 문제집 42~45쪽
            </div>
          </div>
          
          <DuoButton onClick={() => onNavigate('camera')}>
            📷 다시 제출하기
          </DuoButton>
        </div>
      </div>
      
      {/* 팁 */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>💡</span>
        <div style={{ color: COLORS.white, fontSize: '14px', lineHeight: '1.5' }}>
          <strong>촬영 팁!</strong><br/>
          창가 근처 밝은 곳에서 찍으면 글씨가 잘 보여요
        </div>
      </div>
    </div>
  </div>
);


// ============================================================
// 교사 화면들
// ============================================================

// 7. 교사 오늘 현황 대시보드
const TeacherDashboard = ({ onNavigate }) => {
  const stats = {
    total: 25,
    submitted: 22,
    notSubmitted: 3,
    pending: 2
  };
  
  const notSubmittedStudents = [
    { id: 1, name: '김영희', avatar: '👧' },
    { id: 2, name: '박철수', avatar: '👦' },
    { id: 3, name: '이민지', avatar: '👧' },
  ];
  
  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.background,
      fontFamily: FONTS.main
    }}>
      {/* 교사용 헤더 */}
      <div style={{
        background: COLORS.backgroundDark,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ color: COLORS.white, fontSize: '18px', fontWeight: '800' }}>
          👨‍🏫 5학년 2반
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '6px 14px',
          borderRadius: '20px',
          color: COLORS.white,
          fontSize: '13px',
          fontWeight: '700'
        }}>
          12월 20일 금요일
        </div>
      </div>
      
      <div style={{ padding: '20px' }}>
        {/* 오늘 현황 요약 */}
        <div style={{
          background: COLORS.white,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 4px 0 rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '800',
            color: COLORS.text,
            marginBottom: '16px'
          }}>
            📊 오늘 제출 현황
          </div>
          
          {/* 프로그레스 링 대용 바 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: COLORS.text }}>
                제출률
              </span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: COLORS.primary }}>
                {Math.round((stats.submitted / stats.total) * 100)}%
              </span>
            </div>
            <div style={{
              height: '20px',
              background: COLORS.gray,
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(stats.submitted / stats.total) * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${COLORS.primary} 0%, #78E100 100%)`,
                borderRadius: '10px'
              }} />
            </div>
          </div>
          
          {/* 통계 숫자들 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            <div style={{
              background: '#E8F5E9',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: COLORS.primary }}>
                {stats.submitted}
              </div>
              <div style={{ fontSize: '12px', color: COLORS.primaryDark, fontWeight: '600' }}>
                제출 완료
              </div>
            </div>
            <div style={{
              background: '#FFEBEE',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: COLORS.rejected }}>
                {stats.notSubmitted}
              </div>
              <div style={{ fontSize: '12px', color: COLORS.rejected, fontWeight: '600' }}>
                미제출
              </div>
            </div>
            <div style={{
              background: '#FFF8E1',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: COLORS.streak }}>
                {stats.pending}
              </div>
              <div style={{ fontSize: '12px', color: COLORS.streakDark, fontWeight: '600' }}>
                확인 대기
              </div>
            </div>
          </div>
        </div>
        
        {/* 미제출 학생 리스트 (강조) */}
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.rejected} 0%, #FF6B6B 100%)`,
          borderRadius: '16px',
          padding: '18px',
          marginBottom: '20px',
          boxShadow: '0 4px 0 #CC3D3D'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px'
          }}>
            <div style={{
              color: COLORS.white,
              fontSize: '16px',
              fontWeight: '800'
            }}>
              ⚠️ 미제출 학생 ({stats.notSubmitted}명)
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notSubmittedStudents.map((student) => (
              <div key={student.id} style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>{student.avatar}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: COLORS.text }}>{student.name}</div>
                  <div style={{ fontSize: '12px', color: COLORS.rejected }}>아직 제출하지 않음</div>
                </div>
                <span style={{ fontSize: '20px' }}>⚪</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 확인 대기 */}
        <div 
          onClick={() => onNavigate('teacherReview')}
          style={{
            background: COLORS.white,
            borderRadius: '16px',
            padding: '18px',
            boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>📋</span>
              <div>
                <div style={{ fontWeight: '800', color: COLORS.text, fontSize: '15px' }}>
                  제출물 확인하기
                </div>
                <div style={{ fontSize: '13px', color: COLORS.textLight }}>
                  {stats.pending}개의 새 제출물이 있어요
                </div>
              </div>
            </div>
            <div style={{
              background: COLORS.streak,
              color: COLORS.white,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '800'
            }}>
              {stats.pending}
            </div>
          </div>
        </div>
        
        {/* 안내 문구 */}
        <div style={{
          marginTop: '20px',
          padding: '14px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px'
        }}>
          <div style={{
            color: COLORS.white,
            fontSize: '13px',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>💡</span>
            <div>
              <strong>확인은 선택사항이에요!</strong><br/>
              제출 즉시 시스템에 자동 기록되며, 별도 확인이 필요 없어요.
            </div>
          </div>
        </div>
      </div>
      
      {/* 하단 탭바 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: COLORS.white,
        padding: '12px 20px',
        paddingBottom: '28px',
        display: 'flex',
        justifyContent: 'space-around',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>📊</div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.primary }}>현황</div>
        </div>
        <div 
          onClick={() => onNavigate('teacherReview')}
          style={{ textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '24px' }}>📋</div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.grayDark }}>확인</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>📅</div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.grayDark }}>기록</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>⚙️</div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: COLORS.grayDark }}>설정</div>
        </div>
      </div>
    </div>
  );
};


// 8. 교사 제출 확인/반려 화면
const TeacherReview = ({ onNavigate }) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  const submissions = [
    { id: 1, name: '이지훈', avatar: '👦', time: '10분 전' },
    { id: 2, name: '정수아', avatar: '👧', time: '25분 전' },
  ];
  
  const rejectReasons = [
    { id: 1, icon: '📸', text: '사진이 흐려요' },
    { id: 2, icon: '❌', text: '과제가 아니에요' },
    { id: 3, icon: '🔁', text: '다시 제출 필요' },
  ];
  
  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.background,
      fontFamily: FONTS.main,
      paddingBottom: '100px'
    }}>
      {/* 헤더 */}
      <div style={{
        background: COLORS.backgroundDark,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div 
          onClick={() => onNavigate('teacherDashboard')}
          style={{ color: COLORS.white, cursor: 'pointer', fontSize: '18px' }}
        >
          ←
        </div>
        <div style={{ color: COLORS.white, fontSize: '18px', fontWeight: '800' }}>
          📋 제출물 확인
        </div>
      </div>
      
      <div style={{ padding: '20px' }}>
        {submissions.map((submission, index) => (
          <div key={submission.id} style={{
            background: COLORS.white,
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '16px',
            boxShadow: '0 4px 0 rgba(0,0,0,0.1)'
          }}>
            {/* 학생 정보 */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid #E5E5E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px' }}>{submission.avatar}</span>
                <div>
                  <div style={{ fontWeight: '800', color: COLORS.text }}>{submission.name}</div>
                  <div style={{ fontSize: '12px', color: COLORS.textLight }}>{submission.time}</div>
                </div>
              </div>
              <span style={{
                background: '#FFF8E1',
                color: COLORS.streak,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                확인 대기
              </span>
            </div>
            
            {/* 사진 미리보기 영역 */}
            <div style={{
              padding: '18px',
              background: '#F7F7F7'
            }}>
              <div style={{
                aspectRatio: '4/3',
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '48px', marginBottom: '8px' }}>📄</span>
                <div style={{ color: COLORS.secondary, fontWeight: '700', fontSize: '14px' }}>
                  수학 문제집 42~45쪽
                </div>
              </div>
            </div>
            
            {/* 버튼들 */}
            <div style={{
              padding: '14px 18px',
              display: 'flex',
              gap: '10px'
            }}>
              <div style={{ flex: 1 }}>
                <DuoButton 
                  onClick={() => setShowRejectModal(true)}
                  color={COLORS.gray}
                  shadowColor="#CDCDCD"
                  size="small"
                >
                  <span style={{ color: COLORS.rejected }}>반려</span>
                </DuoButton>
              </div>
              <div style={{ flex: 2 }}>
                <DuoButton size="small">
                  ✓ 승인
                </DuoButton>
              </div>
            </div>
          </div>
        ))}
        
        {/* 모두 확인 완료 시 */}
        {submissions.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <span style={{ fontSize: '64px' }}>✨</span>
            <div style={{
              color: COLORS.white,
              fontSize: '18px',
              fontWeight: '800',
              marginTop: '16px'
            }}>
              모든 제출물을 확인했어요!
            </div>
          </div>
        )}
      </div>
      
      {/* 반려 사유 선택 모달 */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}>
          <div style={{
            background: COLORS.white,
            borderRadius: '24px 24px 0 0',
            padding: '24px',
            paddingBottom: '40px',
            width: '100%'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '800',
              color: COLORS.text,
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              반려 사유 선택
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {rejectReasons.map((reason) => (
                <div 
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${selectedReason === reason.id ? COLORS.rejected : '#E5E5E5'}`,
                    background: selectedReason === reason.id ? '#FFF5F5' : COLORS.white,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{reason.icon}</span>
                  <span style={{ 
                    fontWeight: '700', 
                    color: selectedReason === reason.id ? COLORS.rejected : COLORS.text
                  }}>
                    {reason.text}
                  </span>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <DuoButton 
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedReason(null);
                  }}
                  color={COLORS.gray}
                  shadowColor="#CDCDCD"
                >
                  <span style={{ color: COLORS.text }}>취소</span>
                </DuoButton>
              </div>
              <div style={{ flex: 1 }}>
                <DuoButton 
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedReason(null);
                  }}
                  color={COLORS.rejected}
                  shadowColor="#CC3D3D"
                  disabled={!selectedReason}
                >
                  반려하기
                </DuoButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ============================================================
// 메인 앱 - 네비게이션
// ============================================================
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [userType, setUserType] = useState('student'); // 'student' or 'teacher'
  
  const navigate = (screen) => {
    setCurrentScreen(screen);
  };
  
  const renderScreen = () => {
    // 학생 화면들
    if (userType === 'student') {
      switch(currentScreen) {
        case 'home':
          return <StudentHome onNavigate={navigate} streak={5} />;
        case 'homeRejected':
          return <StudentHome onNavigate={navigate} streak={5} hasRejected={true} />;
        case 'taskDetail':
          return <TaskDetail onNavigate={navigate} />;
        case 'camera':
          return <CameraScreen onNavigate={navigate} />;
        case 'submitSuccess':
          return <SubmitSuccess onNavigate={navigate} newStreak={6} />;
        case 'calendar':
          return <CalendarScreen onNavigate={navigate} />;
        case 'rejected':
          return <RejectedNotice onNavigate={navigate} />;
        default:
          return <StudentHome onNavigate={navigate} />;
      }
    }
    
    // 교사 화면들
    switch(currentScreen) {
      case 'teacherDashboard':
        return <TeacherDashboard onNavigate={navigate} />;
      case 'teacherReview':
        return <TeacherReview onNavigate={navigate} />;
      default:
        return <TeacherDashboard onNavigate={navigate} />;
    }
  };
  
  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', position: 'relative' }}>
      {/* 화면 전환 네비게이션 (개발용) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '430px',
        width: '100%',
        background: '#1A1B2E',
        padding: '8px 12px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        zIndex: 2000,
        borderBottom: '1px solid #333'
      }}>
        {/* 사용자 타입 전환 */}
        <button
          onClick={() => {
            setUserType(userType === 'student' ? 'teacher' : 'student');
            setCurrentScreen(userType === 'student' ? 'teacherDashboard' : 'home');
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            border: 'none',
            background: userType === 'student' ? COLORS.secondary : COLORS.streak,
            color: 'white',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {userType === 'student' ? '👨‍🎓 학생' : '👨‍🏫 교사'}
        </button>
        
        <div style={{ width: '1px', background: '#444', margin: '0 4px' }} />
        
        {/* 학생 화면들 */}
        {userType === 'student' && (
          <>
            {[
              { id: 'home', label: '홈' },
              { id: 'homeRejected', label: '홈(반려)' },
              { id: 'taskDetail', label: '상세' },
              { id: 'camera', label: '촬영' },
              { id: 'submitSuccess', label: '완료' },
              { id: 'calendar', label: '달력' },
              { id: 'rejected', label: '반려알림' },
            ].map((screen) => (
              <button
                key={screen.id}
                onClick={() => setCurrentScreen(screen.id)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '16px',
                  border: 'none',
                  background: currentScreen === screen.id ? COLORS.primary : '#333',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {screen.label}
              </button>
            ))}
          </>
        )}
        
        {/* 교사 화면들 */}
        {userType === 'teacher' && (
          <>
            {[
              { id: 'teacherDashboard', label: '현황' },
              { id: 'teacherReview', label: '확인' },
            ].map((screen) => (
              <button
                key={screen.id}
                onClick={() => setCurrentScreen(screen.id)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '16px',
                  border: 'none',
                  background: currentScreen === screen.id ? COLORS.primary : '#333',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {screen.label}
              </button>
            ))}
          </>
        )}
      </div>
      
      {/* 메인 콘텐츠 */}
      <div style={{ paddingTop: '44px' }}>
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;