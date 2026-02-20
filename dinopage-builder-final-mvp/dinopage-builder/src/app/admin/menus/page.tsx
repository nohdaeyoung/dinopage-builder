"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Menu {
  id: string
  name: string
  type: "PAGE" | "CUSTOM"
  sortOrder: number
  parentId: string | null
  isActive: boolean
  children?: Menu[]
}

// 정렬 가능한 아이템 컴포넌트
function SortableItem({ menu, onDelete }: { menu: Menu; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: menu.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border rounded-lg p-4 mb-2 flex items-center justify-between shadow-sm cursor-move hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-400">≡</span>
        <div>
          <span className="font-medium">{menu.name}</span>
          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {menu.type}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation() // 드래그 방지
            if (confirm("정말 삭제하시겠습니까?")) onDelete(menu.id)
          }}
          className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
        >
          삭제
        </button>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menus")
      const data = await res.json()
      setMenus(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setMenus((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSaveOrder = async () => {
    setIsSaving(true)
    try {
      // 순서 업데이트 payload 생성
      const updates = menus.map((menu, index) => ({
        id: menu.id,
        sortOrder: index,
        parentId: null, // 1단계만 구현 (MVP)
      }))

      const res = await fetch("/api/menus/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updates }),
      })

      if (!res.ok) throw new Error("저장 실패")
      alert("메뉴 순서가 저장되었습니다")
    } catch (error) {
      alert("저장 중 오류가 발생했습니다")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/menus/${id}`, { method: "DELETE" })
      setMenus(menus.filter(m => m.id !== id))
    } catch (error) {
      alert("삭제 실패")
    }
  }

  if (loading) return <div className="p-8">로딩 중...</div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">메뉴 설정</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/menus/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + 메뉴 추가
          </Link>
          <button
            onClick={handleSaveOrder}
            disabled={isSaving}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? "저장 중..." : "순서 저장"}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={menus.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {menus.map((menu) => (
              <SortableItem key={menu.id} menu={menu} onDelete={handleDelete} />
            ))}
          </SortableContext>
        </DndContext>
        
        {menus.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            등록된 메뉴가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}