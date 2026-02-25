export interface PixResult {
    externalId: string;
    pixCode: string;
    pixQrBase64: string;
    expiresAt: Date;
}

export interface IPaymentGateway {
    createPixPayment(amount: number, email: string, description: string): Promise<PixResult>;
    getPaymentStatus(externalId: string): Promise<'PENDING' | 'APPROVED' | 'CANCELLED' | 'EXPIRED'>;
    createPayout(amount: number, pixKey: string, description: string, email?: string): Promise<{ id: string; status: string }>;
    getPayoutStatus(idEnvio: string): Promise<'PENDING' | 'APPROVED' | 'FAILED'>;
}
