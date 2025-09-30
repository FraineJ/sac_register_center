import { useState, useEffect } from "react";
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
import { login } from "@/services/auth.service";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido").min(1, "El email es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("dataUser");
    if (userData) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await login(data.email, data.password);
      if ([200, 201].includes(response.status)) {
        toast({ title: "¡Inicio de sesión exitoso!", description: "Redirigiendo..." });
        localStorage.setItem("dataUser", JSON.stringify(response.data));
        navigate("/dashboard");
      } else {
        toast({
          title: "ERROR",
          description: "Verifique su usuario o contraseña",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error de conexión",
        description: "No se pudo iniciar sesión. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-5">
      {/* Columna izquierda: Formulario simple */}
      <div className="md:col-span-2 flex items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-2">Iniciar sesión</h1>
          <p className="text-sm text-slate-600 mb-6">Accede a tu panel</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
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

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Tu contraseña"
                          {...field}
                          disabled={isLoading}
                          className="pl-9 pr-10"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
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
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Columna derecha: Más grande, imagen de fondo + texto encima */}
      <div
        className="md:col-span-3 relative min-h-[40vh] md:min-h-screen hidden md:block"
        style={{
          backgroundImage: "url('/assets/telemetry-hero.jpg')",
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

export default Login;
