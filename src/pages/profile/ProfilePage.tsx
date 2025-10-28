// ProfileView.jsx
import { userService } from '@/services/user.services';
import React, { useState, useEffect } from 'react';

const ProfileView = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileImage, setProfileImage] = useState('/default-avatar.png');
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const dataUser = localStorage.getItem("dataUser");
            const parsedData = JSON.parse(dataUser);
            const response = await userService.getInfoUser(parsedData.userData.id);

            const data = await response.data;
            setUserData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            // Aquí iría la llamada a tu API para cambiar la contraseña
            console.log('Cambiando contraseña:', passwordData);

            // Simulando una llamada exitosa
            alert('Contraseña cambiada exitosamente');
            setIsEditingPassword(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            alert('Error al cambiar la contraseña');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">No se encontraron datos del usuario</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">


            <div>
                <h1 className="text-3xl font-bold text-foreground">Perfil de Usuario</h1>
                <p className="text-muted-foreground">Gestiona tu información personal y seguridad</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna izquierda - Imagen de perfil */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex flex-col items-center">
                            {/* Imagen de perfil */}
                            <div className="relative mb-4">
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                />
                                <label
                                    htmlFor="profile-image"
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                                <input
                                    id="profile-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            <h2 className="text-xl font-semibold text-gray-900">
                                {userData.name} {userData.last_name}
                            </h2>
                            <p className="text-gray-600 text-sm">{userData.email}</p>
                        </div>
                    </div>
                </div>

                {/* Columna derecha - Información y contraseña */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Información del usuario */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <p className="mt-1 text-sm text-gray-900">{userData.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                <p className="mt-1 text-sm text-gray-900">{userData.last_name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <p className="mt-1 text-sm text-gray-900">{userData.phone_number}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                                <p className="mt-1 text-sm text-gray-900">{userData.documentType}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Identificación</label>
                                <p className="mt-1 text-sm text-gray-900">{userData.identification}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                <p className="mt-1 text-sm text-gray-900">{userData.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cambio de contraseña */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Seguridad</h3>
                            <button
                                onClick={() => setIsEditingPassword(!isEditingPassword)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                            >
                                {isEditingPassword ? 'Cancelar' : 'Cambiar Contraseña'}
                            </button>
                        </div>

                        {isEditingPassword && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                        Contraseña Actual
                                    </label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                        Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Confirmar Nueva Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Actualizar Contraseña
                                </button>
                            </form>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileView;