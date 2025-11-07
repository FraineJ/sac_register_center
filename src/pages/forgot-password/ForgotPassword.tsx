// ForgotPassword.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import BannerLogin from '../../../public/banner-login.jpg';
import { forgotPassword } from "@/services/auth.service";

const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un email válido").min(1, "El email es requerido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // Simular envío de email (reemplaza con tu API real)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await forgotPassword(data.email);

      if (response.status == 201 || response.status == 200) {
        setEmailSent(true);
        toast({
          title: "Email enviado",
          description: "Hemos enviado las instrucciones para restablecer tu contraseña a tu correo electrónico.",
        });
      }


    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el email. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-5">
        {/* Columna izquierda: Mensaje de éxito */}
        <div className="md:col-span-2 flex items-center justify-center p-6 md:p-10 bg-white">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold mb-4">¡Email enviado!</h1>

            <p className="text-slate-600 mb-6">
              Hemos enviado las instrucciones para restablecer tu contraseña a
              <strong> {form.getValues("email")}</strong>.
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Volver al inicio de sesión
              </Button>

              <Button
                onClick={() => {
                  setEmailSent(false);
                  form.reset();
                }}
                variant="outline"
                className="w-full"
              >
                Enviar a otro email
              </Button>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              ¿No recibiste el email? Revisa tu carpeta de spam o
              <button
                onClick={() => {
                  setEmailSent(false);
                  form.setValue("email", form.getValues("email"));
                }}
                className="text-blue-600 hover:text-blue-800 ml-1 underline"
              >
                intenta enviarlo nuevamente
              </button>
            </p>
          </div>
        </div>

        {/* Columna derecha: Banner */}
        <div
          className="md:col-span-3 relative min-h-[40vh] md:min-h-screen hidden md:block"
          style={{
            backgroundImage: `url(${BannerLogin})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[#0b2343]/60" />
          <div className="relative z-10 h-full flex items-center">
            <div className="px-8 md:px-14 lg:px-20">
              <div className="inline-flex items-center gap-2 text-cyan-200/90 text-xs uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Sac register
              </div>
              <h2 className="mt-3 text-3xl lg:text-4xl font-semibold text-white leading-tight">
                Expertos en <span className="text-cyan-300">inspección y certificación naval</span>
              </h2>
              <p className="mt-3 text-white/80 max-w-xl">
                Garantizamos la seguridad y cumplimiento normativo de tu flota marítima.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-5">
      {/* Columna izquierda: Formulario */}
      <div className="md:col-span-2 flex items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-md">
          {/* Botón de volver */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 -ml-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al login
          </Button>

          <h1 className="text-2xl font-semibold mb-2">Restablecer contraseña</h1>
          <p className="text-sm text-slate-600 mb-6">
            Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          {...field}
                          disabled={isLoading}
                          className="pl-9"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando instrucciones...
                  </>
                ) : (
                  "Aceptar"
                )}
              </Button>
            </form>
          </Form>

          {/* Información adicional */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-sm font-medium text-slate-900 mb-2">
              ¿Qué esperar?
            </h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Recibirás un email con un enlace para restablecer tu contraseña</li>
              <li>• El enlace expirará en 30 minutos por seguridad</li>
              <li>• Si no ves el email, revisa tu carpeta de spam</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Columna derecha: Banner */}
      <div
        className="md:col-span-3 relative min-h-[40vh] md:min-h-screen hidden md:block"
        style={{
          backgroundImage: `url(${BannerLogin})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay para legibilidad */}
        <div className="absolute inset-0 bg-[#0b2343]/60" />

        {/* Texto superpuesto */}
        <div className="relative z-10 h-full flex items-center">
          <div className="px-8 md:px-14 lg:px-20">
            <div className="inline-flex items-center gap-2 text-cyan-200/90 text-xs uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Sac register
            </div>
            <h2 className="mt-3 text-3xl lg:text-4xl font-semibold text-white leading-tight">
              Expertos en <span className="text-cyan-300">inspección y certificación naval</span>
            </h2>
            <p className="mt-3 text-white/80 max-w-xl">
              Garantizamos la seguridad y cumplimiento normativo de tu flota marítima.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;