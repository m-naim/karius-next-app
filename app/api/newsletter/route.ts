import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // You can implement your newsletter provider logic here (e.g., Mailchimp, Buttondown, etc.)
    console.log('Newsletter subscription request for:', email)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
