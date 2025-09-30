import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, Flag, Ship, User, Gauge, ArrowLeft, Info } from 'lucide-react';

interface IFleet {
  id?: string;
  name: string;
  identification: string;
  flag: string;
  type: string;
  capacity: number;
  isOwner: boolean;
  documents: Array<{
    id: string;
    name: string;
    url?: string;
    expirationDate?: string;
    uploadedAt?: string;
  }>;
  image?: string;
  status?: string;
  createdAt?: string;
}

interface FleetDetailsProps {
  vessel: IFleet;
  onClose: () => void;
  onEdit?: (vessel: IFleet) => void;
}

const FleetDetails: React.FC<FleetDetailsProps> = ({ vessel, onClose, onEdit }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === 'inactive') return <Badge variant="secondary" className="uppercase tracking-wide">Inactivo</Badge>;
    if (s === 'maintenance') return <Badge variant="outline" className="uppercase tracking-wide">En mantenimiento</Badge>;
    return <Badge className="uppercase tracking-wide">Activo</Badge>;
  };

  const daysTo = (dateString?: string) => {
    if (!dateString) return undefined;
    const target = new Date(dateString).getTime();
    if (isNaN(target)) return undefined;
    const now = Date.now();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleDownloadDocument = (document: any) => {
    if (document?.url) {
      window.open(document.url, '_blank');
    } else {
      console.log('Descargando documento simulado:', document);
    }
  };

  const InfoRow: React.FC<{ label: React.ReactNode; value: React.ReactNode }> = ({ label, value }) => (
    <div className="rounded-xl border bg-card/50 p-3 md:p-4">
      <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">{label}</p>
      <p className="text-base md:text-lg font-semibold text-foreground break-words">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* === ÚNICA CARD CONTENEDORA === */}
        <Card className="rounded-2xl overflow-hidden border shadow-sm">
          {/* Header de la Card */}
          <div className="bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-cyan-400/10 px-5 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={onClose} className="rounded-2xl">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-xl md:text-2xl">Detalles de la Embarcación</CardTitle>
                <p className="text-sm text-muted-foreground">Información general, imagen y documentos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(vessel)} className="rounded-2xl">Editar</Button>
              )}
              <Button onClick={onClose} className="rounded-2xl">Cerrar</Button>
            </div>
          </div>

          {/* Contenido de la Card (todo dentro) */}
          <CardContent className="p-5 md:p-6 space-y-6">
            {/* Encabezado con nombre, estado y propiedad */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold leading-tight">{vessel.name}</h2>
                <p className="text-sm text-muted-foreground">ID: {vessel.identification}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(vessel.status)}
                <Badge variant={vessel.isOwner ? 'default' : 'outline'} className="uppercase tracking-wide">
                  {vessel.isOwner ? 'Propia' : 'Terceros'}
                </Badge>
                {vessel.createdAt && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Registrada: {formatDate(vessel.createdAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Grid principal: Imagen + Información */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Imagen (columna izquierda) */}
              <section className="lg:col-span-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Imagen</h3>
                {vessel.image ? (
                  <div className="rounded-xl overflow-hidden border bg-black/5">
                    <img
                      src={vessel.image}
                      alt={`Imagen de ${vessel.name}`}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-64 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-muted/30">
                    <div className="text-center">
                      <Ship className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Sin imagen</p>
                    </div>
                  </div>
                )}
              </section>

              {/* Información General (columna derecha más amplia) */}
              <section className="lg:col-span-8">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Información General</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
                  <InfoRow label={<><Flag className="h-4 w-4 inline" /> <span>Bandera</span></>} value={vessel.flag || '—'} />
                  <InfoRow label={<><Info className="h-4 w-4 inline" /> <span>Tipo</span></>} value={vessel.type || '—'} />
                  <InfoRow label={<><Gauge className="h-4 w-4 inline" /> <span>Capacidad</span></>} value={vessel.capacity ? `${vessel.capacity} toneladas` : 'No especificada'} />
                </div>
                {/* Documentos (dentro de la misma card) */}
                {vessel.documents && vessel.documents.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Documentos ({vessel.documents.length})
                      </h3>
                    </div>
                    {vessel.documents.map((doc) => {
                      const days = daysTo(doc.expirationDate);
                      const isExpired = typeof days === 'number' && days < 0;
                      const isSoon = typeof days === 'number' && days >= 0 && days <= 30;
                      return (
                        <div key={doc.id} className="flex items-center justify-between gap-3 p-3 border rounded-xl bg-card/50">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{doc.name}</p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                {doc.expirationDate && (
                                  <span>
                                    Vence: <strong className="font-semibold">{formatDate(doc.expirationDate)}</strong>
                                  </span>
                                )}
                                {typeof days === 'number' && (
                                  <Badge variant={isExpired ? 'destructive' : isSoon ? 'default' : 'secondary'} className="rounded-full">
                                    {isExpired ? 'Vencido' : isSoon ? `Vence en ${days} días` : 'Vigente'}
                                  </Badge>
                                )}
                                {doc.uploadedAt && <span>• Subido: {formatDate(doc.uploadedAt)}</span>}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      );
                    })}
                  </section>
                )}
              </section>
            </div>




          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FleetDetails;