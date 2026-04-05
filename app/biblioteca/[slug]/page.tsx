import { Metadata } from 'next';
import PeptideoDetalhe from '@/components/biblioteca/PeptideoDetalhe';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${params.slug} — Biblioteca Nuvita` };
}

export default function PeptideoPage({ params }: Props) {
  return <PeptideoDetalhe slug={params.slug} />;
}
