import PeptideoDetalhe from '@/components/biblioteca/PeptideoDetalhe';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  return { title: `${params.slug} — Biblioteca Nuvita` };
}

export default function PeptideoPage({ params }: Props) {
  return <PeptideoDetalhe slug={params.slug} />;
}
