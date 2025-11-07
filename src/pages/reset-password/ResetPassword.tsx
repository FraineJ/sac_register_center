import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Cambia useSearchParams por useParams
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
import { Loader2, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import BannerLogin from '../../../public/banner-login.jpg';
import { changePassword } from "@/services/auth.service";

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordReset, setPasswordReset] = useState(false);
    const { token } = useParams(); // Cambia esto
    const navigate = useNavigate();
    const { toast } = useToast();

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const handleSubmit = async (data: ResetPasswordFormData) => {
        console.log("token ", token); // Ahora debería mostrar el token correctamente
        
        if (!token) {
            toast({
                title: "Enlace inválido",
                description: "El enlace de restablecimiento es inválido o ha expirado.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Asegúrate de que changePassword reciba tanto el token como la nueva contraseña
            const response = await changePassword(token, data.password);
            
            if (response.status === 201 || response.status === 200) {
                setPasswordReset(true);
                toast({
                    title: "¡Contraseña restablecida!",
                    description: "Tu contraseña ha sido actualizada correctamente.",
                });
            } else {
                throw new Error("Error en la respuesta del servidor");
            }

        } catch (error) {
            console.error("Error al restablecer contraseña:", error);
            toast({
                title: "Error",
                description: "No se pudo restablecer la contraseña. El enlace puede haber expirado.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    if (passwordReset) {
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

                        <h1 className="text-2xl font-semibold mb-4">¡Contraseña restablecida!</h1>

                        <p className="text-slate-600 mb-6">
                            Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                        </p>

                        <Button
                            onClick={() => navigate("/login")}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            Ir al inicio de sesión
                        </Button>
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

                    <h1 className="text-2xl font-semibold mb-2">Nueva contraseña</h1>
                    <p className="text-sm text-slate-600 mb-6">
                        Crea una nueva contraseña para tu cuenta.
                    </p>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            {/* Nueva contraseña */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nueva contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Ingresa tu nueva contraseña"
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
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Confirmar contraseña */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirma tu nueva contraseña"
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
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    disabled={isLoading}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Requisitos de contraseña */}
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <h4 className="text-sm font-medium text-slate-900 mb-2">
                                    La contraseña debe contener:
                                </h4>
                                <ul className="text-xs text-slate-600 space-y-1">
                                    <li>• Al menos 8 caracteres</li>
                                    <li>• Una letra mayúscula</li>
                                    <li>• Una letra minúscula</li>
                                    <li>• Un número</li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Restableciendo contraseña...
                                    </>
                                ) : (
                                    "Restablecer contraseña"
                                )}
                            </Button>
                        </form>
                    </Form>
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
};

export default ResetPassword;