import { MUTATION_REFRESH_RULES, resolveReloads } from './mutation-refresh.rules';
import { loadActiveTrainers, loadMyTrainer, loadTrainerPricing, loadTrainers } from './trainer/trainer.actions';
import { loadActiveCenters, loadAllCenterEquipment, loadCenters, loadMyCenterEquipment } from './center/center.actions';
import { loadMyBookings, loadMyProviderBookings } from './booking/booking.actions';

const types = (method: string, path: string, role: string | null) =>
  resolveReloads(method, path, role).map(load => load().type);

describe('resolveReloads', () => {
  // Regression: an admin activating/deactivating a trainer got "success" but the row kept its old status
  // until a manual refresh, because nothing re-fetched the list after the direct service call.
  it('an admin changing a trainer reloads the admin and public trainer lists', () => {
    const result = types('PUT', '/trainer/updateTrainerStatus/5', 'admin');

    expect(result).toContain(loadTrainers().type);
    expect(result).toContain(loadActiveTrainers().type);
  });

  it('a trainer changing their own profile reloads their own record, not the admin list', () => {
    const result = types('PUT', '/trainer/update', 'trainer');

    expect(result).toContain(loadMyTrainer().type);
    expect(result).not.toContain(loadTrainers().type);
  });

  it('a client only refreshes lists any signed-in user may load', () => {
    expect(types('PUT', '/trainer/updateTrainerStatus/5', 'client')).toEqual([loadActiveTrainers().type]);
  });

  it('a specific endpoint refreshes just its own list, not the whole trainer list', () => {
    expect(types('POST', '/trainer/addTrainerPricing', 'admin')).toEqual([loadTrainerPricing().type]);
  });

  it('centers get their own admin / own-role split', () => {
    expect(types('POST', '/center/addCenterEquipment', 'admin')).toEqual([loadAllCenterEquipment().type]);
    expect(types('POST', '/center/addCenterEquipment', 'center')).toEqual([loadMyCenterEquipment().type]);
    expect(types('PUT', '/center/updateStatus/3', 'admin')).toEqual([loadActiveCenters().type, loadCenters().type]);
  });

  it('bookings reload the caller\'s own bookings, plus provider bookings for a trainer', () => {
    expect(types('PUT', '/booking/cancel/9', 'user')).toEqual([loadMyBookings().type]);
    expect(types('PUT', '/booking/cancel/9', 'trainer')).toEqual([loadMyBookings().type, loadMyProviderBookings().type]);
  });

  it('never refreshes for a read', () => {
    expect(types('GET', '/trainer/getTrainers', 'admin')).toEqual([]);
  });

  it('likes and view counters change nothing a list shows, so they do not refresh', () => {
    expect(types('PUT', '/trainer/like/5', 'admin')).toEqual([]);
    expect(types('PUT', '/trainer/incrementFeatureVideoViews/5', 'admin')).toEqual([]);
    expect(types('PUT', '/center/like/5', 'admin')).toEqual([]);
  });

  it('login-style calls and unknown endpoints do nothing', () => {
    expect(types('POST', '/user/login', null)).toEqual([]);
    expect(types('POST', '/something/else', 'admin')).toEqual([]);
  });

  it('a signed-out caller still gets only the public loaders', () => {
    expect(types('PUT', '/trainer/updateTrainerStatus/5', null)).toEqual([loadActiveTrainers().type]);
  });

  it('every loader in the table builds a parameterless action', () => {
    for (const rule of MUTATION_REFRESH_RULES) {
      const all = [...(rule.admin ?? []), ...(rule.any ?? []), ...Object.values(rule.roles ?? {}).flat()];
      for (const load of all) {
        expect(typeof load().type).toBe('string');
      }
    }
  });
});
