"use client"

import * as React from "react"
import { format, eachYearOfInterval, getYear, getMonth } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  id?: string
  value?: string
  onChange?: (value: string) => void
  onTimeChange?: (time: string) => void
  timeValue?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

// 快速时间选择选项（常见出生时间）
const QUICK_TIME_OPTIONS = [
  { label: "Midnight", value: "00:00" },
  { label: "Early Morning", value: "06:00" },
  { label: "Noon", value: "12:00" },
  { label: "Evening", value: "18:00" },
]

// 月份名称
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function DatePicker({
  id,
  value,
  onChange,
  onTimeChange,
  timeValue,
  placeholder = "YYYY/MM/DD",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  // Use a fixed date for initial month to avoid hydration mismatch
  // Will be updated on mount if needed
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    if (value) {
      const date = new Date(value)
      return date
    }
    // Use a fixed date instead of new Date() to avoid hydration mismatch
    // This ensures server and client render the same initial value
    return new Date(2024, 0, 1)
  })
  
  // Update currentMonth on mount to use actual current date (only on client)
  React.useEffect(() => {
    if (!selectedDate && !value) {
      setCurrentMonth(new Date())
    }
  }, [selectedDate, value])
  const [showTimePicker, setShowTimePicker] = React.useState(false)
  const [customTime, setCustomTime] = React.useState(timeValue || "")
  
  // 用于跟踪是否是因为选择日期而自动显示时间选择器
  // 如果为 true，说明是自动显示，选择时间后应该关闭
  // 如果为 false，说明是用户主动打开弹窗，应该允许编辑
  const isAutoShowingTimePicker = React.useRef(false)
  
  // 当外部 value 变化时更新内部状态
  React.useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date)
      setCurrentMonth(date)
    }
  }, [value])
  
  // 当外部 timeValue 变化时更新内部状态
  React.useEffect(() => {
    if (timeValue !== undefined) {
      setCustomTime(timeValue)
    }
  }, [timeValue])
  
  // 生成年份列表（最早1930年，最晚当前年份+50年）
  const currentYear = getYear(currentMonth)
  const years = eachYearOfInterval({
    start: new Date(1930, 0, 1),  // 固定最早年份为1930年
    end: new Date(currentYear + 50, 11, 31),
  })
  
  // 处理日期选择
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      if (onChange) {
        const formattedDate = format(date, "yyyy-MM-dd")
        onChange(formattedDate)
      }
      
      // 选择日期后，如果有 onTimeChange，显示时间选择器
      if (onTimeChange) {
        // 标记这是自动显示时间选择器
        isAutoShowingTimePicker.current = true
        setShowTimePicker(true)
      } else {
        // 如果没有时间选择功能，直接关闭
        setOpen(false)
      }
    }
  }
  
  // 处理月份选择
  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(parseInt(monthIndex))
    setCurrentMonth(newDate)
  }
  
  // 处理年份选择
  const handleYearChange = (year: string) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(parseInt(year))
    setCurrentMonth(newDate)
  }
  
  // 处理快速时间选择
  const handleQuickTimeSelect = (time: string) => {
    setCustomTime(time)
    if (onTimeChange) {
      onTimeChange(time)
    }
    
    // 如果这是自动显示的时间选择器，选择时间后关闭整个弹窗
    if (isAutoShowingTimePicker.current) {
      isAutoShowingTimePicker.current = false
      setShowTimePicker(false)
      setOpen(false)
    }
    // 如果是用户主动打开编辑，只关闭时间选择器，回到日期选择界面
    else {
      setShowTimePicker(false)
    }
  }
  
  // 处理自定义时间输入
  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    setCustomTime(time)
    if (onTimeChange) {
      onTimeChange(time)
    }
  }
  
  // 确认选择（当选择了日期和时间后）
  const handleConfirm = () => {
    if (selectedDate && onChange) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      onChange(formattedDate)
    }
    if (customTime && onTimeChange) {
      onTimeChange(customTime)
    }
    
    // 关闭时间选择器和整个弹窗
    isAutoShowingTimePicker.current = false
    setShowTimePicker(false)
    setOpen(false)
  }
  
  // 显示文本
  const displayText = value 
    ? format(selectedDate!, "yyyy/MM/dd") 
    : placeholder

  // 处理弹窗打开/关闭
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    
    if (!isOpen) {
      // 关闭弹窗时重置状态
      setShowTimePicker(false)
      isAutoShowingTimePicker.current = false
    } else {
      // 打开弹窗时，如果已经有时间值，直接显示时间选择器让用户编辑
      // 但这不是自动显示，所以不设置 isAutoShowingTimePicker
      if (onTimeChange && timeValue) {
        setShowTimePicker(true)
        isAutoShowingTimePicker.current = false
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {!showTimePicker ? (
          <div>
            {/* 自定义月份/年份选择器 */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 border-b">
              <Select
                value={getMonth(currentMonth).toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-8 w-[120px] border-none bg-transparent text-sm font-medium hover:bg-accent">
                  <SelectValue>{MONTHS[getMonth(currentMonth)]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={getYear(currentMonth).toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-8 w-[80px] border-none bg-transparent text-sm font-medium hover:bg-accent">
                  <SelectValue>{getYear(currentMonth)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {years.map((yearDate) => {
                    const yearValue = getYear(yearDate)
                    return (
                      <SelectItem key={yearValue} value={yearValue.toString()}>
                        {yearValue}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              initialFocus
              className="p-3"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "hidden",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md"
                ),
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                  "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>
        ) : (
          <div className="p-4 space-y-4 w-64">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Select Time</span>
            </div>
            
            {/* 快速时间选择按钮 */}
            <div className="grid grid-cols-2 gap-2">
              {QUICK_TIME_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={customTime === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleQuickTimeSelect(option.value)
                  }}
                  className="text-xs"
                >
                  {option.label}
                  <span className="ml-1 text-xs opacity-70">{option.value}</span>
                </Button>
              ))}
            </div>
            
            {/* 自定义时间输入 */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Or enter custom time</label>
              <Input
                type="time"
                value={customTime}
                onChange={handleCustomTimeChange}
                className="h-9"
              />
            </div>
            
            {/* 确认按钮 */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // 返回时，如果是自动显示，关闭整个弹窗；否则只返回日期选择
                  if (isAutoShowingTimePicker.current) {
                    isAutoShowingTimePicker.current = false
                    setShowTimePicker(false)
                    setOpen(false)
                  } else {
                    setShowTimePicker(false)
                  }
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleConfirm()
                }}
                className="flex-1"
                disabled={!selectedDate}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
