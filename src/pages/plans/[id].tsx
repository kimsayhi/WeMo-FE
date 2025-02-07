import { fetchPlanDetailSSR, reissueSSR } from '@/api/plan';
import PlanDetailMain from '@/components/planDetail/PlanDetailMain';
import { QUERY_KEY } from '@/constants/queryKey';

import {
  dehydrate,
  DehydratedState,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const cookie = context.req.headers.cookie || '';
  const queryClient = new QueryClient();
  const idNum = parseInt(id as string);
  await queryClient.prefetchQuery({
    queryKey: QUERY_KEY.planDetail(idNum),
    queryFn: async () => {
      try {
        //현재 context에서 불러온 쿠키를 포함시킴
        const response = await fetchPlanDetailSSR(idNum, cookie);
        console.log('첫번째 패치', response);
        if (response === 401) throw new Error();
        return response;
      } catch {
        console.log('catch문 실행');
        const newCookie = await reissueSSR(cookie);
        console.log('reissueSSR 반환값 ', newCookie);
        const response = await fetchPlanDetailSSR(idNum, newCookie);
        console.log('reissueSSR후 리패치데이터', response);
        return response;
      }
    },
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      idNum,
    },
  };
};

interface PlanDetailPageProps {
  dehydratedState: DehydratedState;
  idNum: number;
}

export default function PlanDetailPage({
  dehydratedState,
  idNum,
}: PlanDetailPageProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mx-auto min-h-screen max-w-screen-md">
        <PlanDetailMain id={idNum} />
      </div>
    </HydrationBoundary>
  );
}
