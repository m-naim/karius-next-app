'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addEmail } from '@/services/actions'
import { useFormState } from 'react-dom'

export const NewsletterForm = () => {
  const [addEmailState, addEmailAction] = useFormState(addEmail, {
    error: null,
    success: false,
  })

  return addEmailState.success ? (
    <div className="bg-primary-200/40 flex w-full flex-col place-items-center gap-4 px-4 py-8 text-center">
      <h2>Merci pour votre souscription! 😊</h2>
      <p>Je vous tiendrais informé</p>
    </div>
  ) : (
    <div className="bg-primary-200/40 flex w-full flex-col place-items-center gap-4 px-4 py-8 text-center">
      <h3>Vous voulez être informé de la sortie du produit?</h3>
      <form className="flex w-72  flex-wrap gap-2 sm:flex-nowrap" action={addEmailAction}>
        <Input name="email" className="w-72" placeholder="📧 votre email ..." />
        <Button variant="default" className="w-72">
          Souscrire
        </Button>
      </form>
      <p>Promis! pas de spam inutile 😊</p>
    </div>
  )
}
