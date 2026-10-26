import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paramsToSign } = body;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET || ""
    );

    return NextResponse.json({ signature });
  } catch (error: any) {
    console.error("Cloudinary Signature Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
