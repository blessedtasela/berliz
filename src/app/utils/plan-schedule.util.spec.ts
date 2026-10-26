import {
  MAX_PLAN_SESSIONS, ROTATION_PRESETS, WEEKDAY_PRESETS, addDays, daysBetween, describePattern, eachDate,
  formatTime12, generateSessions, weekdayOf
} from './plan-schedule.util';

// 2026-11-02 is a Monday.
const MON = '2026-11-02';

const dates = (sessions: { date: string }[]) => sessions.map(s => s.date);

describe('plan-schedule.util', () => {

  describe('date helpers', () => {
    it('adds days across month ends and counts them back', () => {
      expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
      expect(daysBetween('2026-11-02', '2026-11-30')).toBe(28);
    });

    it('is not thrown off by a daylight-saving change', () => {
      // Clocks change in early November in North America and late October in Europe.
      expect(addDays('2026-10-31', 2)).toBe('2026-11-02');
      expect(addDays('2026-11-01', 1)).toBe('2026-11-02');
      expect(eachDate('2026-10-25', '2026-11-08').length).toBe(15);
    });

    it('knows the weekday', () => {
      expect(weekdayOf(MON)).toBe(1);
      expect(weekdayOf('2026-11-08')).toBe(0);
    });
  });

  describe('same time on chosen weekdays', () => {
    it('lands on Mon / Wed / Fri across four weeks', () => {
      const result = generateSessions({ kind: 'weekly', weekdays: [1, 3, 5], time: '18:00' }, MON, addDays(MON, 27), 60);

      expect(result.length).toBe(12);
      expect(result[0]).toEqual({ date: '2026-11-02', time: '18:00', durationMinutes: 60 });
      expect(result.every(s => [1, 3, 5].includes(weekdayOf(s.date)))).toBeTrue();
    });

    it('gives nothing until a time and a day are chosen', () => {
      expect(generateSessions({ kind: 'weekly', weekdays: [], time: '18:00' }, MON, addDays(MON, 27), 60)).toEqual([]);
      expect(generateSessions({ kind: 'weekly', weekdays: [1], time: '' }, MON, addDays(MON, 27), 60)).toEqual([]);
    });

    it('the Weekdays preset is five days a week', () => {
      const preset = WEEKDAY_PRESETS.find(p => p.label === 'Weekdays')!;
      expect(generateSessions({ kind: 'weekly', weekdays: preset.days, time: '07:00' }, MON, addDays(MON, 6), 60).length).toBe(5);
    });
  });

  describe('a different time per weekday', () => {
    it('uses each weekday\'s own time', () => {
      const result = generateSessions({ kind: 'weeklyCustom', times: { 1: '06:30', 3: '18:00' } }, MON, addDays(MON, 13), 45);

      expect(result.map(s => `${s.date} ${s.time}`)).toEqual([
        '2026-11-02 06:30', '2026-11-04 18:00', '2026-11-09 06:30', '2026-11-11 18:00',
      ]);
      expect(result.every(s => s.durationMinutes === 45)).toBeTrue();
    });
  });

  describe('rotations', () => {
    it('5 on, 2 off from a Monday is the working week', () => {
      const result = generateSessions({ kind: 'rotation', steps: [{ on: 5, off: 2 }], time: '17:00' }, MON, addDays(MON, 13), 60);

      expect(dates(result)).toEqual([
        '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06',
        '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13',
      ]);
    });

    it('2 on, 1 off repeats every third day', () => {
      const result = generateSessions({ kind: 'rotation', steps: [{ on: 2, off: 1 }], time: '17:00' }, MON, addDays(MON, 8), 60);

      expect(dates(result)).toEqual(['2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06', '2026-11-08', '2026-11-09']);
    });

    it('a two-step rotation (2 on 1 off then 3 on 2 off) cycles through both steps', () => {
      const result = generateSessions({
        kind: 'rotation', steps: [{ on: 2, off: 1 }, { on: 3, off: 2 }], time: '17:00'
      }, MON, addDays(MON, 10), 60);

      // days 0-1 on, 2 off, 3-5 on, 6-7 off, then the cycle (8 days) starts again: 8-9 on, 10 off
      expect(dates(result)).toEqual([
        '2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-10', '2026-11-11',
      ]);
    });

    it('no rest days means every day', () => {
      expect(generateSessions({ kind: 'rotation', steps: [{ on: 3, off: 0 }], time: '17:00' }, MON, addDays(MON, 6), 60).length).toBe(7);
    });

    it('ignores empty steps and gives nothing without any', () => {
      expect(generateSessions({ kind: 'rotation', steps: [{ on: 0, off: 2 }], time: '17:00' }, MON, addDays(MON, 6), 60)).toEqual([]);
    });

    it('every preset produces sessions', () => {
      for (const preset of ROTATION_PRESETS) {
        expect(generateSessions({ kind: 'rotation', steps: preset.steps, time: '17:00' }, MON, addDays(MON, 27), 60).length)
          .withContext(preset.label).toBeGreaterThan(0);
      }
    });
  });

  describe('chosen dates', () => {
    it('keeps only dates inside the period, once each, in order, with per-date overrides', () => {
      const result = generateSessions({
        kind: 'dates',
        dates: ['2026-11-10', '2026-11-04', '2026-11-04', '2027-03-01', '2026-10-01'],
        time: '18:00',
        times: { '2026-11-10': '07:00' },
      }, MON, addDays(MON, 27), 60);

      expect(result.map(s => `${s.date} ${s.time}`)).toEqual(['2026-11-04 18:00', '2026-11-10 07:00']);
    });
  });

  it('never returns more than the maximum number of sessions', () => {
    const result = generateSessions({ kind: 'rotation', steps: [{ on: 1, off: 0 }], time: '09:00' }, MON, addDays(MON, 200), 30);
    expect(result.length).toBe(MAX_PLAN_SESSIONS);
  });

  it('returns nothing when the end is before the start', () => {
    expect(generateSessions({ kind: 'weekly', weekdays: [1], time: '18:00' }, MON, addDays(MON, -3), 60)).toEqual([]);
  });

  describe('wording', () => {
    it('writes times on a 12-hour clock', () => {
      expect(formatTime12('00:00')).toBe('12:00 AM');
      expect(formatTime12('06:15')).toBe('6:15 AM');
      expect(formatTime12('12:45')).toBe('12:45 PM');
      expect(formatTime12('23:30')).toBe('11:30 PM');
    });

    it('describes each pattern in plain words', () => {
      expect(describePattern({ kind: 'weekly', weekdays: [5, 1, 3], time: '18:00' })).toBe('Mon, Wed, Fri at 6:00 PM');
      expect(describePattern({ kind: 'weeklyCustom', times: { 1: '06:30', 3: '18:00' } })).toBe('Mon 6:30 AM · Wed 6:00 PM');
      expect(describePattern({ kind: 'rotation', steps: [{ on: 2, off: 1 }, { on: 3, off: 2 }], time: '17:00' }))
        .toBe('2 on, 1 off, then 3 on, 2 off at 5:00 PM');
      expect(describePattern({ kind: 'dates', dates: ['2026-11-04'], time: '18:00' })).toBe('1 chosen date');
    });
  });
});
