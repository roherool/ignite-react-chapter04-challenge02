import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface ImagesQueryResponse {
  after?: {
    id: string;
  };
  data: {
    title: string;
    description: string;
    url: string;
    ts: number;
    id: string;
  }[];
}

interface Card {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

async function getImages({ pageParam = null }): Promise<ImagesQueryResponse> {
  const response = await api.get<ImagesQueryResponse>('/api/images', {
    params: {
      after: pageParam,
    },
  });
  return response.data;
}

export default function Home(): JSX.Element {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', getImages, {
    getNextPageParam: lastPage => lastPage.after || null,
  });

  const formattedData = useMemo(() => {
    const cards: Card[] = [];
    if (data) {
      data.pages.forEach(page => {
        page.data.forEach(item => {
          console.log(item);
          const card = {} as Card;
          Object.assign(card, {
            id: item.id,
            title: item.title,
            description: item.description,
            ts: item.ts,
            url: item.url,
          } as Card);
          cards.push(card);
        });
      });
    }
    return cards;
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {hasNextPage && (
          <Button
            isLoading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            mt="12"
          >
            Carregar mais
          </Button>
        )}
      </Box>
    </>
  );
}