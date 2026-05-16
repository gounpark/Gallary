import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useArchiveStore } from '@/store/archiveStore'
import { ScreenCard } from '@/components/archive/ScreenCard'
import type { Screen } from '@/store/types'

interface SortableItemProps {
  screen: Screen
  index: number
  onOpenLightbox: (i: number) => void
}

function SortableItem({ screen, index, onOpenLightbox }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: screen.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <ScreenCard
        screen={screen}
        index={index}
        onOpenLightbox={onOpenLightbox}
        sortable
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}

interface SortableScreenListProps {
  flowId: string
  onOpenLightbox: (i: number) => void
}

export function SortableScreenList({ flowId, onOpenLightbox }: SortableScreenListProps) {
  const { getScreensByFlow, reorderScreens } = useArchiveStore()
  const screens = getScreensByFlow(flowId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = screens.findIndex(s => s.id === active.id)
    const newIndex = screens.findIndex(s => s.id === over.id)
    const reordered = arrayMove(screens, oldIndex, newIndex)
    reorderScreens(flowId, reordered.map(s => s.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={screens.map(s => s.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {screens.map((sc, i) => (
            <SortableItem key={sc.id} screen={sc} index={i} onOpenLightbox={onOpenLightbox} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
