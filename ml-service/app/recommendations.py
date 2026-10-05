from typing import List
from app.schemas import RiskFactor


class RecommendationEngine:
    """
    Rule-based recommendation engine for decision-support in bovine mastitis management.
    Produces conservative, actionable farm guidelines based on predicted risk level and top contributing features.
    """

    @staticmethod
    def generate_recommendations(risk_level: str, risk_factors: List[RiskFactor]) -> List[str]:
        recommendations: List[str] = []
        feature_names = [factor.feature.lower() for factor in risk_factors]

        if risk_level == "HIGH":
            recommendations.append("Increase individual animal monitoring frequency to 2-3 times daily.")
            recommendations.append("Inspect udder visually and perform California Mastitis Test (CMT) or foremilk examination.")
            recommendations.append("Consider isolating milk from bulk tank pending clinical evaluation.")
            recommendations.append("Schedule immediate veterinary examination for diagnostic confirmation.")

        elif risk_level == "MODERATE":
            recommendations.append("Increase daily monitoring of SCC, milk conductivity, and milk yield trends.")
            recommendations.append("Ensure proper milking unit alignment, vacuum pressure, and teat dipping protocols.")
            recommendations.append("Re-evaluate housing hygiene, bed cleanliness, and ventilation in the stall.")
            recommendations.append("Re-check risk score in 24-48 hours.")

        elif risk_level == "LOW":
            recommendations.append("Continue routine daily monitoring and standard milking hygiene protocols.")
            recommendations.append("Maintain standard record-keeping for milk yield and automated sensor feeds.")

        else:  # NO_RISK
            recommendations.append("No immediate intervention required. Maintain standard herd health protocols.")

        # Specific feature-driven tailored guidance
        for factor in risk_factors:
            feat = factor.feature.lower()
            if "scc" in feat and factor.impact == "positive":
                if "Inspect teat cups and clean beddings to minimize bacterial contamination risk." not in recommendations:
                    recommendations.append("Inspect teat cups and clean beddings to minimize bacterial contamination risk.")
            if "rumination" in feat and factor.impact == "positive": # reduced rumination
                if "Check feed intake and observe animal for general metabolic or digestive stress." not in recommendations:
                    recommendations.append("Check feed intake and observe animal for general metabolic or digestive stress.")
            if "temperature" in feat and factor.impact == "positive":
                if "Verify body temperature manually with a clinical thermometer." not in recommendations:
                    recommendations.append("Verify body temperature manually with a clinical thermometer.")

        return recommendations
