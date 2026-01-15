import { useState, useEffect, useMemo } from 'react';
import { solarToLunar, lunarToSolar, getLeapMonth, getLunarMonthDays, LUNAR_MONTHS } from '@/lib/lunar-calendar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Moon } from 'lucide-react';

interface LunarDatePickerProps {
  solarYear?: number;
  solarMonth?: number;
  solarDay?: number;
  onChange: (data: {
    solarYear: number;
    solarMonth: number;
    solarDay: number;
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeapMonth: boolean;
  }) => void;
}

export default function LunarDatePicker({
  solarYear,
  solarMonth,
  solarDay,
  onChange
}: LunarDatePickerProps) {
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  
  // 阳历状态
  const [selSolarYear, setSelSolarYear] = useState(solarYear || 1990);
  const [selSolarMonth, setSelSolarMonth] = useState(solarMonth || 1);
  const [selSolarDay, setSelSolarDay] = useState(solarDay || 1);
  
  // 阴历状态
  const [selLunarYear, setSelLunarYear] = useState(1990);
  const [selLunarMonth, setSelLunarMonth] = useState(1);
  const [selLunarDay, setSelLunarDay] = useState(1);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  
  // 初始化时从阳历转换阴历
  useEffect(() => {
    if (solarYear && solarMonth && solarDay) {
      const dateInfo = solarToLunar(solarYear, solarMonth, solarDay);
      setSelLunarYear(dateInfo.lunarYear);
      setSelLunarMonth(Math.abs(dateInfo.lunarMonth));
      setSelLunarDay(dateInfo.lunarDay);
      setIsLeapMonth(dateInfo.isLeapMonth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // 年份选项
  const years = useMemo(() => 
    Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - 100 + i), 
    []
  );
  
  // 阳历月份天数
  const getSolarMonthDays = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };
  
  // 当前阴历年的闰月
  const leapMonthOfYear = useMemo(() => getLeapMonth(selLunarYear), [selLunarYear]);
  
  // 阴历月份选项
  const lunarMonthOptions = useMemo(() => {
    const options: { value: string; label: string; isLeap: boolean }[] = [];
    for (let m = 1; m <= 12; m++) {
      options.push({ value: m.toString(), label: `${LUNAR_MONTHS[m - 1]}月`, isLeap: false });
      if (leapMonthOfYear === m) {
        options.push({ value: `leap-${m}`, label: `闰${LUNAR_MONTHS[m - 1]}月`, isLeap: true });
      }
    }
    return options;
  }, [leapMonthOfYear]);
  
  // 阴历当月天数
  const lunarDaysInMonth = useMemo(() => {
    try {
      return getLunarMonthDays(selLunarYear, selLunarMonth, isLeapMonth);
    } catch {
      return 30;
    }
  }, [selLunarYear, selLunarMonth, isLeapMonth]);
  
  // 阳历当月天数
  const solarDaysInMonth = useMemo(() => 
    getSolarMonthDays(selSolarYear, selSolarMonth), 
    [selSolarYear, selSolarMonth]
  );
  
  // 当阳历变化时，更新阴历并通知父组件
  const handleSolarChange = (year: number, month: number, day: number) => {
    setSelSolarYear(year);
    setSelSolarMonth(month);
    setSelSolarDay(day);
    
    try {
      const dateInfo = solarToLunar(year, month, day);
      setSelLunarYear(dateInfo.lunarYear);
      setSelLunarMonth(Math.abs(dateInfo.lunarMonth));
      setSelLunarDay(dateInfo.lunarDay);
      setIsLeapMonth(dateInfo.isLeapMonth);
      
      onChange({
        solarYear: year,
        solarMonth: month,
        solarDay: day,
        lunarYear: dateInfo.lunarYear,
        lunarMonth: Math.abs(dateInfo.lunarMonth),
        lunarDay: dateInfo.lunarDay,
        isLeapMonth: dateInfo.isLeapMonth
      });
    } catch (e) {
      console.error('Solar to lunar conversion error:', e);
    }
  };
  
  // 当阴历变化时，更新阳历并通知父组件
  const handleLunarChange = (year: number, month: number, day: number, isLeap: boolean) => {
    setSelLunarYear(year);
    setSelLunarMonth(month);
    setSelLunarDay(day);
    setIsLeapMonth(isLeap);
    
    try {
      const dateInfo = lunarToSolar(year, month, day, isLeap);
      setSelSolarYear(dateInfo.solarYear);
      setSelSolarMonth(dateInfo.solarMonth);
      setSelSolarDay(dateInfo.solarDay);
      
      onChange({
        solarYear: dateInfo.solarYear,
        solarMonth: dateInfo.solarMonth,
        solarDay: dateInfo.solarDay,
        lunarYear: year,
        lunarMonth: month,
        lunarDay: day,
        isLeapMonth: isLeap
      });
    } catch (e) {
      console.error('Lunar to solar conversion error:', e);
    }
  };
  
  // 处理阴历月份选择
  const handleLunarMonthSelect = (value: string) => {
    const isLeap = value.startsWith('leap-');
    const month = isLeap ? parseInt(value.replace('leap-', '')) : parseInt(value);
    handleLunarChange(selLunarYear, month, Math.min(selLunarDay, lunarDaysInMonth), isLeap);
  };

  // 当前显示的日期信息
  const dateInfo = useMemo(() => {
    try {
      return solarToLunar(selSolarYear, selSolarMonth, selSolarDay);
    } catch {
      return null;
    }
  }, [selSolarYear, selSolarMonth, selSolarDay]);

  return (
    <div className="space-y-4">
      <Tabs value={calendarType} onValueChange={(v) => setCalendarType(v as 'solar' | 'lunar')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="solar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            阳历
          </TabsTrigger>
          <TabsTrigger value="lunar" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            阴历
          </TabsTrigger>
        </TabsList>

        {/* 阳历选择 */}
        <TabsContent value="solar" className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">年</Label>
              <Select 
                value={selSolarYear.toString()} 
                onValueChange={(v) => handleSolarChange(parseInt(v), selSolarMonth, Math.min(selSolarDay, getSolarMonthDays(parseInt(v), selSolarMonth)))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">月</Label>
              <Select 
                value={selSolarMonth.toString()} 
                onValueChange={(v) => handleSolarChange(selSolarYear, parseInt(v), Math.min(selSolarDay, getSolarMonthDays(selSolarYear, parseInt(v))))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month}月
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">日</Label>
              <Select 
                value={selSolarDay.toString()} 
                onValueChange={(v) => handleSolarChange(selSolarYear, selSolarMonth, parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Array.from({ length: solarDaysInMonth }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}日
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* 阴历选择 */}
        <TabsContent value="lunar" className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">年</Label>
              <Select 
                value={selLunarYear.toString()} 
                onValueChange={(v) => handleLunarChange(parseInt(v), selLunarMonth, selLunarDay, isLeapMonth)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">月</Label>
              <Select 
                value={isLeapMonth ? `leap-${selLunarMonth}` : selLunarMonth.toString()} 
                onValueChange={handleLunarMonthSelect}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lunarMonthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">日</Label>
              <Select 
                value={selLunarDay.toString()} 
                onValueChange={(v) => handleLunarChange(selLunarYear, selLunarMonth, parseInt(v), isLeapMonth)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Array.from({ length: lunarDaysInMonth }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}日
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 显示转换结果 */}
      {dateInfo && (
        <div className="p-3 rounded-lg bg-secondary/50 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>阳历：{selSolarYear}年{selSolarMonth}月{selSolarDay}日</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <span>阴历：{dateInfo.lunarMonthName}{dateInfo.lunarDayName}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{dateInfo.ganZhiYear}年</Badge>
            <Badge variant="outline" className="text-xs">{dateInfo.ganZhiMonth}月</Badge>
            <Badge variant="outline" className="text-xs">{dateInfo.ganZhiDay}日</Badge>
            {dateInfo.jieQi && (
              <Badge variant="secondary" className="text-xs">{dateInfo.jieQi}</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
