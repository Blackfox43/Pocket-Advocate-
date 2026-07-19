import { PresetScenario } from "../types";

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "landlord-deposit",
    title: "Security Deposit Retention",
    category: "landlord",
    opponentName: "Mr. Henderson",
    opponentRole: "Landlord",
    topic: "Retaining entire security deposit for routine painting and wear-and-tear",
    text: "Look, standard procedure is that we repaint the entire unit when a tenant leaves, and that labor fee is $1,200. Plus, deep cleaning is $300. So that eats up your entire $1,500 deposit. I don't make the rules, it's just standard landlord practice in this state. You can try to sue me but it'll cost you more in lawyer fees anyway.",
  },
  {
    id: "employer-unpaid-overtime",
    title: "Unpaid Weekend Overtime",
    category: "employer",
    opponentName: "Marcus Vance",
    opponentRole: "General Manager",
    topic: "GM demanding weekend audit work be logged as 'voluntary development' to bypass overtime pay",
    text: "Emma, I need you to stay late this Friday and come in on Saturday to finish the client audit. The thing is, our team budget is maxed out, so we can't authorize overtime pay. I'm going to need you to just write this down as voluntary professional development on your sheet. We all do it, it's a team effort and I remember who is a team player when promotion season rolls around next month.",
  },
  {
    id: "insurance-claim-denial",
    title: "Hail Damage Claim Denial",
    category: "insurance",
    opponentName: "Apex Insurance Claims Rep",
    opponentRole: "Insurance Claim Adjuster",
    topic: "Adjuster denying roof repair claim by auto-attributing hail damage to pre-existing decay",
    text: "We've reviewed your claim for hail damage on the roof. Unfortunately, our standard automated policy algorithm indicates this is standard pre-existing deterioration and normal roof wear and tear. Therefore, your claim is fully denied. If you want to appeal, you'll need to hire an independent structural engineer out of your own pocket to prove otherwise. Let me know if you want to close this claim today.",
  },
  {
    id: "landlord-rent-increase",
    title: "Sudden 40% Rent Spike",
    category: "landlord",
    opponentName: "Property Management Office",
    opponentRole: "Agent",
    topic: "Mid-lease rent spike with 48-hour signature demand",
    text: "Due to changing market conditions and inflation, your rent is increasing from $1,600 to $2,250 starting next month. Yes, I know you still have 4 months on your lease, but we're standardizing our rates now. We need you to sign this rent addendum within 48 hours or we will begin the non-renewal process and list the apartment this weekend.",
  }
];
