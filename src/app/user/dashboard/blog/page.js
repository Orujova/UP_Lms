import Card from '@/components/card';

export default function Page() {
  return (
    <main>
      <h1 className="text-xxl sm:text-48 font-semibold sm:mb-14">Xəbərlər</h1>
      <div className="sm:flex gap-perCard sm:flex-wrap overflow-x- w-full block">
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </div>
    </main>
  );
}
