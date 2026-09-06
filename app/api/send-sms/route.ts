import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { phoneNumber, messageBody } = await request.json()

    if (!phoneNumber || !messageBody) {
      return NextResponse.json({ error: 'phone_number e message_body são obrigatórios' }, { status: 400 })
    }

    const apiKey = process.env.TELCOSMS_API_KEY_PRD || process.env.NEXT_PUBLIC_TELCOSMS_API_KEY || 'prd354b6528346ae17fc032f53363'

    // Formatar número de telefone angolano (garantir formato de digitação Ex: 923xxxxxx)
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '')
    if (formattedPhone.startsWith('244') && formattedPhone.length > 9) {
      formattedPhone = formattedPhone.substring(3)
    }

    const payload = {
      message: {
        api_key_app: apiKey,
        phone_number: formattedPhone,
        message_body: messageBody,
      },
    }

    const response = await fetch('https://www.telcosms.co.ao/send_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Erro na rota /api/send-sms:', error)
    return NextResponse.json({ error: error?.message || 'Erro ao enviar SMS' }, { status: 500 })
  }
}
