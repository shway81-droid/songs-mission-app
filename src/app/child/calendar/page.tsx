'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isFuture } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useUserStore } from '@/stores/userStore';
import { TopHeader } from '@/components/ui';
import { getSubmissionsByMonth } from '@/lib/firestore';
import { Submission } from '@/types';

type DayStatus = 'done' | 'rejected' | 'today' | 'none' | 'future';

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  status: DayStatus;
}

export default function CalendarPage() {
  const router = useRouter();
  const { currentUser, isChild, hasHydrated } = useUserStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    // hydration 완료 전에는 아무것도 하지 않음
    if (!hasHydrated) return;

    if (!currentUser || !isChild()) {
      router.replace('/select');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getSubmissionsByMonth(currentUser.id, year, month);
        setSubmissions(data);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [hasHydrated, currentUser, isChild, router, year, month]);

  // 달력 데이터와 통계를 useMemo로 계산
  const { calendarDays, stats } = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    const firstDayOfWeek = getDay(start);
    const paddedDays: (CalendarDay | null)[] = Array(firstDayOfWeek).fill(null);

    let doneCount = 0;
    let rejectedCount = 0;
    let noneCount = 0;

    days.forEach((date) => {
      let status: DayStatus = 'none';

      if (isFuture(date) && !isToday(date)) {
        status = 'future';
      } else if (isToday(date)) {
        const todaySubmission = submissions.find((s) => isSameDay(s.submittedAt, date));
        if (todaySubmission) {
          status = todaySubmission.status === 'rejected' ? 'rejected' : 'done';
          if (status === 'done') doneCount++;
          else rejectedCount++;
        } else {
          status = 'today';
        }
      } else {
        const submission = submissions.find((s) => isSameDay(s.submittedAt, date));
        if (submission) {
          if (submission.status === 'rejected') {
            status = 'rejected';
            rejectedCount++;
          } else {
            status = 'done';
            doneCount++;
          }
        } else {
          // 주말 제외 카운트
          const dayOfWeek = getDay(date);
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            noneCount++;
          }
        }
      }

      paddedDays.push({
        date,
        dayOfMonth: date.getDate(),
        status,
      });
    });

    return {
      calendarDays: paddedDays,
      stats: { done: doneCount, none: noneCount, rejected: rejectedCount },
    };
  }, [currentDate, submissions]);

  const getStatusStyle = (status: DayStatus) => {
    switch (status) {
      case 'done':
        return { bg: 'bg-primary', color: 'text-white', icon: '⭕' };
      case 'rejected':
        return { bg: 'bg-error', color: 'text-white', icon: '🔴' };
      case 'today':
        return { bg: 'bg-warning', color: 'text-gray-500', icon: '📝' };
      case 'none':
        return { bg: 'bg-gray-200', color: 'text-gray-300', icon: '⚪' };
      default:
        return { bg: 'bg-gray-100', color: 'text-gray-200', icon: '' };
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <TopHeader
        title="📅 내 기록"
        onBack={() => router.back()}
        showStreak={false}
      />

      <div className="p-5">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="text-white text-xl font-bold p-2"
          >
            ←
          </button>
          <div className="text-white text-2xl font-extrabold flex items-center gap-3">
            <span>📅</span>
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </div>
          <button
            onClick={nextMonth}
            className="text-white text-xl font-bold p-2"
          >
            →
          </button>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div
            className="bg-white rounded-xl p-3.5 text-center"
            style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.1)' }}
          >
            <div className="text-2xl font-extrabold text-primary">{stats.done}</div>
            <div className="text-xs text-gray-400 font-semibold">제출 ⭕</div>
          </div>
          <div
            className="bg-white rounded-xl p-3.5 text-center"
            style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.1)' }}
          >
            <div className="text-2xl font-extrabold text-gray-300">{stats.none}</div>
            <div className="text-xs text-gray-400 font-semibold">미제출 ⚪</div>
          </div>
          <div
            className="bg-white rounded-xl p-3.5 text-center"
            style={{ boxShadow: '0 2px 0 rgba(0,0,0,0.1)' }}
          >
            <div className="text-2xl font-extrabold text-error">{stats.rejected}</div>
            <div className="text-xs text-gray-400 font-semibold">반려 🔴</div>
          </div>
        </div>

        {/* 달력 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}
        >
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <div
                key={day}
                className={`text-center text-xs font-bold py-2 ${
                  i === 0 ? 'text-error' : i === 6 ? 'text-secondary' : 'text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, i) => {
              if (!item) return <div key={i} />;
              const style = getStatusStyle(item.status);
              const isCurrentDay = isToday(item.date);

              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`aspect-square rounded-[10px] ${style.bg} flex flex-col items-center justify-center text-xs font-bold ${style.color}`}
                  style={{
                    border: isCurrentDay ? '2px solid #58CC02' : 'none',
                  }}
                >
                  {item.status === 'done' || item.status === 'rejected' ? (
                    <span className="text-base">{style.icon}</span>
                  ) : (
                    item.dayOfMonth
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 범례 */}
        <div className="mt-4 flex justify-center gap-5">
          {[
            { icon: '⭕', label: '제출', color: 'text-primary' },
            { icon: '⚪', label: '미제출', color: 'text-gray-300' },
            { icon: '🔴', label: '반려', color: 'text-error' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 text-white text-[13px] font-semibold"
            >
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
