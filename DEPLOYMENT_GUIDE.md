# Guia Final de Correção de Saques (EFI Pay)

Implementei as correções definitivas para o sistema de saques, incluindo suporte a chaves dedicadas e um facilitador para o registro de Webhooks exigido pela EFI.

## Resumo das Implementações

### Deployment e Backup (EasyPanel)
- **[GitHub Repo](https://github.com/OverSoccerClub/Palpita_Ai.git)**: Todo o código foi sincronizado, incluindo as configurações para nuvem.
- **[easypanel.json](file:///c:/Projetos/Web/Palpita%20Ai/easypanel.json)**: Arquivo pronto para importar no seu painel.
- **Conexão com Banco**: O `docker-compose.yml` e o `DATABASE_URL` foram configurados com as credenciais da sua imagem: `palpitai-app_postgres-banco`.

## Guia de Instalação no EasyPanel

1. No seu EasyPanel, crie um novo **Projeto** chamado `palpitai-app`.
2. O Banco de Dados já existe (vimos na imagem), então vamos focar na API e Web:
3. **API (Backend)**:
   - Crie um novo serviço do tipo **App**.
   - **Aba Github**: Build Path = `backend` (sem a barra inicial).
   - **Aba Dockerfile**: Mude o campo **Path** de `Dockerfile` para `backend/Dockerfile`.
   - Use a variável de ambiente: `DATABASE_URL=postgresql://postgres:Infor586467@palpitai-app_postgres-banco:5432/palpitai-app?sslmode=disable`.
4. **Web (Frontend)**:
   - Crie outro serviço do tipo **App**.
   - **Aba Github**: Build Path = `frontend` (sem a barra inicial).
   - **Aba Dockerfile**: Mude o campo **Path** de `Dockerfile` para `frontend/Dockerfile`.
   - Configure a variável: `NEXT_PUBLIC_API_URL=https://sua-url-da-api.com`.

### Frontend e Backend
- **[AlertDialog.tsx](file:///c:/Projetos/Web/Palpita%20Ai/frontend/src/components/ui/AlertDialog.tsx)**: Resolvido o crash que impedia o uso de alertas do tipo `warning`.
- **Botão "Retentar Payout"**: Agora disponível na tela de saques para resolver pendências rapidamente.

## Como Ativar o Saque Automático Agora

Para resolver o erro `conta_chave_sem_webhook`, a EFI exige que a chave Pix tenha um registro de Webhook. Siga estes passos:

1. **Abra um terminal** na pasta do projeto (`backend`).
2. **Execute o script de registro** passando a URL do seu site (ou qualquer URL HTTPS válida):
   ```bash
   node scripts/register-webhook.js https://palpita-ai.com/api/wallet/webhook
   ```
   *Nota: A URL precisa estar acessível via internet para a EFI validar o registro.*

3. **Confirme no Painel da EFI**: Se o script der erro de "Inacessível", você deve cadastrar manualmente em **Pix → Configurações → Webhooks** no painel da EFI Pay usando a chave configurada no sistema.

## Caso do Juarez e Próximos Saques

- O caso do Juarez já está registrado como pago no sistema. Recomendo fazer o Pix manual pelo seu banco apenas para essa última transação de **R$ 20,00**.
- Assim que o Webhook acima for registrado, os próximos saques funcionarão direto pelo botão **Aprovar (Automático)**.

> [!IMPORTANT]
> A idempotência foi implementada: se você tentar "Retentar Payout" várias vezes, o sistema garante que o mesmo Pix não seja enviado duas vezes por engano.
