import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

    if (!accessKey) {
      console.error('Web3Forms API key not found in environment variables');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('API Route - Submitting to Web3Forms with key:', accessKey.substring(0, 5) + '...');

    // Submit to Web3Forms
    const web3formsResponse = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        name,
        email,
        subject,
        message,
        from_name: name,
        replyto: email,
      }),
    });

    const result = await web3formsResponse.json();

    console.log('Web3Forms Response Status:', web3formsResponse.status);
    console.log('Web3Forms Response Body:', result);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } else {
      console.error('Web3Forms error:', result);
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to send message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
