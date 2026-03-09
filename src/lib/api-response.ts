import { NextResponse } from 'next/server';

export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: any;
};

export function ApiSuccess<T>(data: T, message?: string, meta?: any) {
    const payload: ApiResponse<T> = { success: true, data };
    if (message) payload.message = message;
    if (meta) payload.meta = meta;
    return NextResponse.json(payload, { status: 200 });
}

export function ApiError(error: string, status = 400, message?: string) {
    const payload: ApiResponse = { success: false, error };
    if (message) payload.message = message;
    return NextResponse.json(payload, { status });
}
