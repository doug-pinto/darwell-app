type ClientPageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

export default async function ClientPage({
  params,
}: ClientPageProps) {
  const { clientId } = await params;

  return <h1>Client: {clientId}</h1>;
}