'use server';

import { revalidatePath } from 'next/cache';
import { auth, signIn, signOut } from './auth';
import supabase from './supabase';
import { getBookings } from './data-service';
import { redirect } from 'next/navigation';

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in!');

  const nationalID = formData.get('nationalID');
  const [nationality, countryFlag] = formData.get('nationality').split('%');

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error('Please provide a valid national ID');

  const updateData = { nationalID, nationality, countryFlag };

  const { data, error } = await supabase
    .from('guests')
    .update(updateData)
    .eq('id', session.user.guestId);

  if (error) throw new Error('Guest could not be updated');

  revalidatePath('/account/profile');
}

export async function deleteReservation(bookingID) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in!');

  const guestBookings = await getBookings(session.user.guestId);
  const guestIDs = guestBookings.map((booking) => booking.id);

  if (!guestIDs.includes(bookingID))
    throw new Error('You are not allowed to delete this booking');

  // await new Promise((res) => setTimeout(res, 5000));

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingID);

  if (error) {
    throw new Error('Booking could not be deleted');
  }

  revalidatePath('/account/reservations');
}

export async function updateReservation(formData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in!');

  const reservationId = Number(formData.get('reservationId'));
  const guestBookings = await getBookings(session.user.guestId);
  const guestIDs = guestBookings.map((booking) => booking.id);

  if (!guestIDs.includes(reservationId))
    throw new Error('You are not allowed to update this booking');

  console.log(formData);

  const numGuests = Number(formData.get('numGuests'));
  const observations = formData.get('observations').slice(0, 1000);

  const updatedFields = { numGuests, observations };

  const { error } = await supabase
    .from('bookings')
    .update(updatedFields)
    .eq('id', reservationId)
    .select()
    .single();

  if (error) throw new Error('Booking could not be updated');

  revalidatePath(`/account/reservations/edit/${reservationId}`);
  revalidatePath('/account/reservations/');
  redirect('/account/reservations');
}

export async function SignInAction() {
  await signIn('google', { redirectTo: '/account' });
}

export async function SignOutAction() {
  await signOut({ redirectTo: '/' });
}
