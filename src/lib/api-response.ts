import { NextResponse } from 'next/server'

export const apiResponse = (
  data: any,
  status: number = 200,
  message: string = 'Success'
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  )
}

export const apiError = (
  message: string = 'Internal Server Error',
  status: number = 500,
  error: any = null
) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    },
    { status }
  )
}
