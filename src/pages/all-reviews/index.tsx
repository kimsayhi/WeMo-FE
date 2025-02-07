import Tabs from '@/components/plans/tab/Tabs';
import { GetStaticProps } from 'next';
import { Review } from '@/types/reviewType';

import ReviewContainer from '@/components/all-reviews/ReviewContainer';
import {
  dehydrate,
  DehydratedState,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import fetchReviews from '@/api/reviews';

const CATEGORIES = [{ category: '달램핏' }, { category: '워케이션' }];
const DEFAULT_CATEGORY = CATEGORIES[0].category;

interface ReviewPageProps {
  dehydratedState: DehydratedState;
}

const ReviewPage = ({ dehydratedState }: ReviewPageProps) => {
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Tabs
          tabs={CATEGORIES}
          defaultTab={DEFAULT_CATEGORY}
          renderContent={(category) => <ReviewContainer category={category} />}
        />
      </div>
    </HydrationBoundary>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient();
  const category = '달램핏';
  const filters = { region: null, subRegion: null, date: null, sort: null };
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['reviews', category, filters],
    queryFn: ({ pageParam = 1 }) => fetchReviews(category, filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage: { reviews: Review[]; nextPage?: number }) =>
      lastPage.nextPage || null,
  });
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 30,
  };
};

export default ReviewPage;
