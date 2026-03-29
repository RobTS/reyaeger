import { DateTime } from 'luxon';

export type RemoteDataTypes =
  | 'Appending'
  | 'FailureWithoutData'
  | 'FailureWithData'
  | 'Loading'
  | 'NotRequested'
  | 'Success'
  | 'Refreshing'
  | 'NeedsRefresh';

type AppendingType<T, M> = {
  type: 'Appending';
  data: T;
  meta: M;
};

type FailureWithoutDataType<M, E> = {
  timestamp: string;
  type: 'FailureWithoutData';
  meta: M;
  error: E;
  data?: undefined;
};

type FailureWithDataType<T, M, E> = {
  timestamp: string;
  type: 'FailureWithData';
  data: T;
  error: E;
  meta: M;
};

type LoadingType<M> = {
  type: 'Loading';
  meta: M;
  data?: undefined;
};

type NotRequestedType = {
  type: 'NotRequested';
  data?: undefined;
  meta?: undefined;
};

type SuccessType<T, M> = {
  timestamp: string;
  type: 'Success';
  data: T;
  meta: M;
};

type NeedsRefreshType<T, M> = {
  type: 'NeedsRefresh';
  data: T;
  meta: M;
};

// Special case (eg. pagination). Request state is Loading",
// but previous data must remain available
type RefreshingType<T, M> = {
  type: 'Refreshing';
  data: T;
  meta: M;
};

export type RemoteFeedDataType<T, E, M = undefined> =
  | AppendingType<T, M>
  | FailureWithoutDataType<M, E>
  | FailureWithDataType<T, M, E>
  | LoadingType<M>
  | NotRequestedType
  | SuccessType<T, M>
  | RefreshingType<T, M>
  | NeedsRefreshType<T, M>;

export type RemoteDataType<T, E, M = undefined> = Exclude<
  RemoteFeedDataType<T, E, M>,
  AppendingType<T, M>
>;

export const Appending = <T, M>(data: T, meta: M): AppendingType<T, M> => ({
  data,
  meta,
  type: 'Appending',
});

const FailureWithoutData = <M, E>(
  error: E,
  meta: M,
): FailureWithoutDataType<M, E> => ({
  error,
  meta,
  timestamp: DateTime.now().toISO(),
  type: 'FailureWithoutData',
});

const FailureWithData = <T, M, E>(
  data: T,
  error: E,
  meta: M,
): FailureWithDataType<T, M, E> => ({
  data,
  error,
  meta,
  timestamp: DateTime.now().toISO(),
  type: 'FailureWithData',
});

export const Failure = <T, M, E>(
  error: E,
  meta: M,
  data?: T,
): FailureWithDataType<T, M, E> | FailureWithoutDataType<M, E> => {
  if (data) return FailureWithData<T, M, E>(data, error, meta);
  return FailureWithoutData<M, E>(error, meta);
};

export const NotRequested: NotRequestedType = {
  type: 'NotRequested',
};

export const Success = <T, M>(data: T, meta: M): SuccessType<T, M> => ({
  data,
  meta,
  type: 'Success',
  timestamp: DateTime.now().toISO(),
});

export const NeedsRefresh = <T, M>(
  data: T,
  meta: M,
): NeedsRefreshType<T, M> => ({
  data,
  meta,
  type: 'NeedsRefresh',
});

export const Refreshing = <T, M>(data: T, meta: M): RefreshingType<T, M> => ({
  data,
  meta,
  type: 'Refreshing',
});

export const Loading = <M>(meta: M): LoadingType<M> => ({
  meta,
  type: 'Loading',
});

export const hasData = <T, M, E>(
  remoteData: RemoteDataType<T, E, M> | RemoteFeedDataType<T, E, M> | undefined,
): remoteData is
  | FailureWithDataType<T, M, E>
  | RefreshingType<T, M>
  | SuccessType<T, M>
  | AppendingType<T, M>
  | NeedsRefreshType<T, M> => {
  if (!remoteData) return false;
  const allowedTypes = [
    'Appending',
    'FailureWithData',
    'Refreshing',
    'Success',
    'NeedsRefresh',
  ];
  return allowedTypes.includes(remoteData.type);
};

export const hasMeta = <T, M, E>(
  remoteData: RemoteDataType<T, E, M> | RemoteFeedDataType<T, E, M> | undefined,
): remoteData is
  | AppendingType<T, M>
  | FailureWithoutDataType<M, E>
  | FailureWithDataType<T, M, E>
  | LoadingType<M>
  | RefreshingType<T, M>
  | SuccessType<T, M> => {
  if (!remoteData) return false;
  return [
    'Appending',
    'FailureWithoutData',
    'FailureWithData',
    'Loading',
    'Refreshing',
    'Success',
    'NeedsRefresh',
  ].includes(remoteData.type);
};

export const isFailure = <T, M, E>(
  remoteData: RemoteDataType<T, E, M> | RemoteFeedDataType<T, E, M> | undefined,
): remoteData is
  | FailureWithoutDataType<M, E>
  | FailureWithDataType<T, M, E> => {
  if (!remoteData) return false;
  return (
    remoteData.type === 'FailureWithoutData' ||
    remoteData.type === 'FailureWithData'
  );
};

export const isFailureNewerThan = <T, M, E>(
  remoteData: RemoteDataType<T, E, M> | RemoteFeedDataType<T, E, M> | undefined,
  seconds: number,
): remoteData is
  | FailureWithoutDataType<M, E>
  | FailureWithDataType<T, M, E> => {
  if (!remoteData) return false;
  if (
    remoteData.type === 'FailureWithoutData' ||
    remoteData.type === 'FailureWithData'
  ) {
    return (
      DateTime.now().minus({ seconds }) > DateTime.fromISO(remoteData.timestamp)
    );
  }
  return false;
};

export const isLoading = <T, M, E>(
  remoteData: RemoteDataType<T, E, M> | RemoteFeedDataType<T, E, M> | undefined,
): remoteData is LoadingType<M> | AppendingType<T, M> => {
  if (!remoteData) return false;
  return remoteData.type === 'Loading' || remoteData.type === 'Appending';
};

export const needsRefresh = <T, M, E>(
  remoteData: RemoteDataType<T, E, M> | RemoteFeedDataType<T, E, M> | undefined,
  maxAgeSeconds: number = 300,
): remoteData is LoadingType<M> | AppendingType<T, M> => {
  if (!remoteData) return true;
  return (
    remoteData.type === 'NotRequested' ||
    remoteData.type === 'NeedsRefresh' ||
    (maxAgeSeconds > 0 &&
      isSuccess(remoteData) &&
      DateTime.now().minus({ seconds: maxAgeSeconds }) >
        DateTime.fromISO(remoteData.timestamp))
  );
};

export const isNotRequested = <T, M, E>(
  remoteData: RemoteDataType<T, M, E> | RemoteFeedDataType<T, M, E> | undefined,
): remoteData is NotRequestedType => {
  if (!remoteData) return true;
  return remoteData.type === 'NotRequested';
};

export const isSuccess = <T, M, E>(
  remoteData: RemoteDataType<T, E, M> | RemoteFeedDataType<T, E, M> | undefined,
): remoteData is SuccessType<T, M> => {
  if (!remoteData) return false;
  return remoteData.type === 'Success';
};

export const isRefreshing = <T, M, E>(
  remoteData: RemoteDataType<T, E, M> | RemoteFeedDataType<T, E, M> | undefined,
): remoteData is RefreshingType<T, M> => {
  if (!remoteData) return false;
  return remoteData.type === 'Refreshing';
};

export const isBusy = <T, M, E>(
  remoteData: RemoteDataType<T, E, M> | RemoteFeedDataType<T, E, M> | undefined,
): remoteData is RefreshingType<T, M> => {
  if (!remoteData) return false;
  return ['Loading', 'Refreshing', 'Appending'].includes(remoteData.type);
};
