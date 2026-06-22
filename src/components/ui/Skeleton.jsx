function SkeletonLine({ w = 'w-full', h = 'h-4' }) {
  return <div className={`${w} ${h} animate-pulse rounded-xl bg-[#F0E6F6]`} />
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[#F0E6F6]" />
      <div className="flex flex-1 flex-col gap-2">
        <SkeletonLine w="w-1/3" />
        <SkeletonLine w="w-1/2" h="h-3" />
      </div>
    </div>
  )
}

export function SkeletonRows({ count = 5 }) {
  return (
    <div className="divide-y divide-[#F0E6F6]">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}
