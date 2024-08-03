import { useRouter } from 'next/router';
import TeacherNavbar from './TeacherNavbar';
import HeadmasterNavbar from './HeadmasterNavbar';
import dynamic from 'next/dynamic';

function Navbar() {
  const { pathname } = useRouter();
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

  // Sembunyikan Navbar jika di halaman login
  if (pathname === '/login') {
    return null;
  }

  // Tampilkan Navbar sesuai dengan role
  return role === 'Admin' ? <TeacherNavbar /> : <HeadmasterNavbar />;
}

export default dynamic(() => Promise.resolve(Navbar), {ssr: false})
