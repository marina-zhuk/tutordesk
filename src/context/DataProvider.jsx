// Хранилище демо-данных в памяти. Датасет собирается из активной ниши при
// монтировании; смена ниши / «Сбросить демо» пересоздают провайдер (key в App),
// поэтому состояние возвращается к чистым мокам. localStorage намеренно нет.

import { useMemo, useRef, useState } from 'react'
import { DataContext } from './DataContext.js'
import { useConfig } from './useConfig.js'
import { useToast } from './useToast.js'
import { buildDataset } from '../data/generate.js'

export function DataProvider({ children }) {
  const { niche, labels } = useConfig()
  const toast = useToast()
  const [data, setData] = useState(() => buildDataset(niche.students))
  const counter = useRef(0)

  const value = useMemo(() => {
    const nextId = (prefix) => `${prefix}-new-${++counter.current}`

    const addStudent = (s) => {
      setData((d) => ({ ...d, students: [{ id: nextId('s'), ...s }, ...d.students] }))
      toast.show(`${labels.person} добавлен`)
    }
    const updateStudent = (id, s) => {
      setData((d) => ({ ...d, students: d.students.map((x) => (x.id === id ? { ...x, ...s } : x)) }))
      toast.show('Изменения сохранены')
    }
    const deleteStudent = (id) => {
      setData((d) => ({
        ...d,
        students: d.students.filter((x) => x.id !== id),
        lessons: d.lessons.filter((l) => l.studentId !== id),
        payments: d.payments.filter((p) => p.studentId !== id),
      }))
      toast.show(`${labels.person} удалён`)
    }

    const addLesson = (l) => {
      setData((d) => ({ ...d, lessons: [...d.lessons, { id: nextId('l'), status: 'запланировано', ...l }] }))
      toast.show('Добавлено в расписание')
    }
    const updateLesson = (id, l) => {
      setData((d) => ({ ...d, lessons: d.lessons.map((x) => (x.id === id ? { ...x, ...l } : x)) }))
      toast.show('Изменения сохранены')
    }
    const cancelLesson = (id) => {
      setData((d) => ({ ...d, lessons: d.lessons.map((x) => (x.id === id ? { ...x, status: 'отменено' } : x)) }))
      toast.show('Отменено')
    }
    const markLessonConducted = (id) => {
      setData((d) => ({ ...d, lessons: d.lessons.map((x) => (x.id === id ? { ...x, status: 'проведено' } : x)) }))
      toast.show('Статус обновлён')
    }
    const deleteLesson = (id) => {
      setData((d) => ({ ...d, lessons: d.lessons.filter((x) => x.id !== id) }))
      toast.show('Удалено из расписания')
    }

    return {
      students: data.students,
      lessons: data.lessons,
      payments: data.payments,
      addStudent,
      updateStudent,
      deleteStudent,
      addLesson,
      updateLesson,
      cancelLesson,
      markLessonConducted,
      deleteLesson,
    }
  }, [data, labels, toast])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
