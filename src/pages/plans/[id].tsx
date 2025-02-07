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
        if (response === 401) throw new Error();
        return response;
      } catch (error: unknown) {
        if (!(error === 401)) return;
        //쿠키가 만료되었을 경우 새로운 accessToken을 불러옴
        const newCookie = await reissueSSR(cookie);
        //여기서 쿠키를 불러온다음 패치하는 거니까 쿠키가 자동으로 포함이 될까?
        const response = await fetchPlanDetailSSR(idNum, newCookie);
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
