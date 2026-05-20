import { MercadoPagoConfig, PreApproval, PreApprovalPlan } from "mercadopago";

export function getMPClient() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN not configured");
  return new MercadoPagoConfig({ accessToken: token });
}

export type CreateSubscriptionParams = {
  planMpId: string;
  payerEmail: string;
  backUrl: string;
};

export async function createMPSubscription(params: CreateSubscriptionParams) {
  const client      = getMPClient();
  const preApproval = new PreApproval(client);

  const result = await preApproval.create({
    body: {
      preapproval_plan_id: params.planMpId,
      payer_email:         params.payerEmail,
      back_url:            params.backUrl,
      auto_recurring: {
        frequency:      1,
        frequency_type: "months",
        currency_id:    "USD",
      },
    },
  });

  return {
    id:          result.id!,
    checkoutUrl: result.init_point!,
    status:      result.status as string,
  };
}

export async function getMPSubscription(mpSubId: string) {
  const client      = getMPClient();
  const preApproval = new PreApproval(client);
  return preApproval.get({ id: mpSubId });
}

export async function cancelMPSubscription(mpSubId: string) {
  const client      = getMPClient();
  const preApproval = new PreApproval(client);
  return preApproval.update({ id: mpSubId, body: { status: "cancelled" } });
}

export async function createMPPlan(params: {
  reason: string;
  amountUSD: number;
  backUrl: string;
}) {
  const client = getMPClient();
  const plan   = new PreApprovalPlan(client);

  const result = await plan.create({
    body: {
      reason:    params.reason,
      back_url:  params.backUrl,
      auto_recurring: {
        frequency:      1,
        frequency_type: "months",
        transaction_amount: params.amountUSD,
        currency_id:    "USD",
      },
    },
  });

  return { id: result.id!, initPoint: result.init_point! };
}
