import api from './api';
import { UpdateProfilePayload, User } from '@iam-project/types';

export const updateSelf = async (payload: UpdateProfilePayload) => {
    const {data} = await api.patch<User>('/users/me', payload);
    return data;
}