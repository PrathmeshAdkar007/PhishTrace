import { useEffect, useState } from "react";

import "./Campaigns.css";


const API_BASE = "http://localhost:5000";


function Campaigns() {

    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================================================
    // LOAD CAMPAIGNS + CASE DETAILS
    // =========================================================

    useEffect(() => {

        const loadCampaigns = async () => {

            try {

                setLoading(true);
                setError("");


                const campaignResponse = await fetch(
                    `${API_BASE}/api/campaigns/correlate`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );


                const campaignData =
                    await campaignResponse.json();


                if (!campaignResponse.ok) {

                    throw new Error(
                        campaignData.error ||
                        "Failed to load campaigns"
                    );

                }


                const rawCampaigns =
                    campaignData.campaigns || [];


                // -------------------------------------------------
                // GET DETAILS FOR EACH CASE
                // -------------------------------------------------

                const enrichedCampaigns =
                    await Promise.all(

                        rawCampaigns.map(
                            async (campaign) => {

                                const caseIds =
                                    campaign.cases || [];


                                const caseDetails =
                                    await Promise.all(

                                        caseIds.map(
                                            async (caseId) => {

                                                try {

                                                    const response =
                                                        await fetch(
                                                            `${API_BASE}/api/cases/${caseId}`,
                                                            {
                                                                method: "GET",
                                                                credentials: "include"
                                                            }
                                                        );


                                                    if (!response.ok) {

                                                        return {
                                                            id: caseId,
                                                            case_number:
                                                                `Case ${caseId}`
                                                        };

                                                    }


                                                    const data =
                                                        await response.json();


                                                    return data.case;

                                                } catch {

                                                    return {
                                                        id: caseId,
                                                        case_number:
                                                            `Case ${caseId}`
                                                    };

                                                }

                                            }
                                        )

                                    );


                                return {

                                    ...campaign,

                                    case_details:
                                        caseDetails

                                };

                            }
                        )

                    );


                setCampaigns(
                    enrichedCampaigns
                );


            } catch (err) {

                console.error(
                    "Campaign loading failed:",
                    err
                );


                setError(
                    err.message ||
                    "Failed to load campaigns"
                );


            } finally {

                setLoading(false);

            }

        };


        loadCampaigns();

    }, []);


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="campaign-page">

                <div className="campaign-loading">

                    Loading campaign intelligence...

                </div>

            </div>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <div className="campaign-page">

                <div className="campaign-page-header">

                    <div>

                        <h1>
                            Campaign Correlation
                        </h1>

                        <p>
                            Detect related phishing activity
                            across investigations
                        </p>

                    </div>

                </div>


                <div className="campaign-error">

                    <h3>
                        Unable to load campaigns
                    </h3>

                    <p>
                        {error}
                    </p>

                </div>

            </div>

        );

    }


    // =========================================================
    // MAIN PAGE
    // =========================================================

    return (

        <div className="campaign-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="campaign-page-header">

                <div>

                    <h1>
                        Campaign Correlation
                    </h1>

                    <p>
                        Detect related phishing activity
                        across investigations
                    </p>

                </div>


                <div className="campaign-count">

                    <strong>
                        {campaigns.length}
                    </strong>

                    <span>
                        {campaigns.length === 1
                            ? "Campaign"
                            : "Campaigns"
                        }
                    </span>

                </div>

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {campaigns.length === 0 && (

                <div className="campaign-empty">

                    <div className="campaign-empty-icon">
                        ◈
                    </div>

                    <h2>
                        No campaigns detected
                    </h2>

                    <p>
                        PhishTrace has not identified related
                        phishing activity across the available
                        investigations.
                    </p>

                </div>

            )}


            {/* =================================================
                CAMPAIGNS
            ================================================= */}

            <div className="campaign-list">

                {campaigns.map(
                    (campaign, index) => {

                        const cases =
                            campaign.case_details || [];


                        const indicators =
                            campaign.common_indicators || [];


                        // =================================================
                        // CAMPAIGN RISK DATA
                        // =================================================

                        const riskScore =
                            campaign.risk_score ?? 0;


                        const riskSeverity =
                            (
                                campaign.risk_severity ||
                                "low"
                            ).toUpperCase();


                        const riskBreakdown =
                            campaign.risk_breakdown || {};


                        const correlationRisk =
                            riskBreakdown.correlation ?? 0;


                        const findingsRisk =
                            riskBreakdown.findings ?? 0;


                        const threatIntelRisk =
                            riskBreakdown.threat_intelligence ?? 0;


                        const userImpactRisk =
                            riskBreakdown.user_impact ?? 0;


                        // Maximum values used by the backend
                        const correlationMax = 25;
                        const findingsMax = 30;
                        const threatIntelMax = 25;
                        const userImpactMax = 20;


                        return (

                            <div
                                className="campaign-card"
                                key={
                                    campaign.campaign_id ||
                                    index
                                }
                            >


                                {/* =================================
                                    CAMPAIGN HEADER
                                ================================= */}

                                <div className="campaign-card-header">

                                    <div>

                                        <span className="campaign-overline">
                                            PHISHING CAMPAIGN
                                        </span>

                                        <h2>
                                            {campaign.campaign_id}
                                        </h2>

                                    </div>


                                    <span className="campaign-badge">
                                        DETECTED
                                    </span>

                                </div>


                                {/* =================================
                                    STATS
                                ================================= */}

                                <div className="campaign-stats">

                                    <div className="campaign-stat">

                                        <span>
                                            Related Cases
                                        </span>

                                        <strong>
                                            {
                                                campaign.case_count ??
                                                cases.length
                                            }
                                        </strong>

                                    </div>


                                    <div className="campaign-stat">

                                        <span>
                                            Common Indicators
                                        </span>

                                        <strong>
                                            {indicators.length}
                                        </strong>

                                    </div>


                                    <div className="campaign-stat">

                                        <span>
                                            Correlation
                                        </span>

                                        <strong>
                                            {
                                                campaign.correlation_score ??
                                                campaign.correlation ??
                                                0
                                            }/100
                                        </strong>

                                    </div>

                                </div>


                                {/* =================================
                                    RISK ASSESSMENT
                                ================================= */}

                                <div className="campaign-risk-section">

                                    <div className="campaign-risk-header">

                                        <div>

                                            <h3>
                                                Risk Assessment
                                            </h3>

                                            <span>
                                                Campaign-level risk
                                                based on correlated
                                                evidence
                                            </span>

                                        </div>

                                    </div>


                                    <div className="campaign-risk-score">

                                        <strong>
                                            {riskScore}
                                        </strong>

                                        <span>
                                            RISK SCORE
                                        </span>

                                    </div>


                                    <div className="campaign-risk-grid">

                                        <div className="campaign-risk-stat">

                                            <span>
                                                Risk Level
                                            </span>

                                            <strong>
                                                {riskSeverity}
                                            </strong>

                                        </div>


                                        <div className="campaign-risk-stat">

                                            <span>
                                                Status
                                            </span>

                                            <strong>
                                                DETECTED
                                            </strong>

                                        </div>


                                        <div className="campaign-risk-stat">

                                            <span>
                                                Related Cases
                                            </span>

                                            <strong>
                                                {
                                                    campaign.case_count ??
                                                    cases.length
                                                }
                                            </strong>

                                        </div>


                                        <div className="campaign-risk-stat">

                                            <span>
                                                Common Indicators
                                            </span>

                                            <strong>
                                                {indicators.length}
                                            </strong>

                                        </div>


                                        <div className="campaign-risk-stat">

                                            <span>
                                                Correlation Risk
                                            </span>

                                            <strong>
                                                {correlationRisk}/
                                                {correlationMax}
                                            </strong>

                                        </div>


                                        <div className="campaign-risk-stat">

                                            <span>
                                                Findings Risk
                                            </span>

                                            <strong>
                                                {findingsRisk}/
                                                {findingsMax}
                                            </strong>

                                        </div>


                                        <div className="campaign-risk-stat">

                                            <span>
                                                Threat Intel Risk
                                            </span>

                                            <strong>
                                                {threatIntelRisk}/
                                                {threatIntelMax}
                                            </strong>

                                        </div>


                                        <div className="campaign-risk-stat">

                                            <span>
                                                User Impact
                                            </span>

                                            <strong>
                                                {userImpactRisk}/
                                                {userImpactMax}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="campaign-risk-summary">

                                        Campaign contains{" "}

                                        <strong>
                                            {
                                                campaign.case_count ??
                                                cases.length
                                            }
                                        </strong>{" "}

                                        related cases and{" "}

                                        <strong>
                                            {indicators.length}
                                        </strong>{" "}

                                        common indicators.

                                        <br />

                                        Overall campaign risk is{" "}

                                        <strong>
                                            {riskSeverity.toLowerCase()}
                                        </strong>{" "}

                                        with a score of{" "}

                                        <strong>
                                            {riskScore}/100
                                        </strong>.

                                    </div>

                                </div>


                                {/* =================================
                                    RELATED CASES
                                ================================= */}

                                <div className="campaign-section">

                                    <div className="section-heading">

                                        <div>

                                            <h3>
                                                Related Cases
                                            </h3>

                                            <span>
                                                Investigations connected
                                                to this campaign
                                            </span>

                                        </div>


                                        <strong>
                                            {cases.length}
                                        </strong>

                                    </div>


                                    <div className="related-case-list">

                                        {cases.map(
                                            (caseItem) => (

                                                <div
                                                    className="related-case"
                                                    key={caseItem.id}
                                                    onClick={() => {
                                                        window.location.href =
                                                            `/cases/${caseItem.id}`;
                                                    }}
                                                    style={{
                                                        cursor: "pointer"
                                                    }}
                                                >

                                                    <div className="case-icon">
                                                        ◉
                                                    </div>


                                                    <div className="case-information">

                                                        <strong>
                                                            {
                                                                caseItem.case_number ||
                                                                `Case ${caseItem.id}`
                                                            }
                                                        </strong>


                                                        {caseItem.title && (

                                                            <span>
                                                                {
                                                                    caseItem.title
                                                                }
                                                            </span>

                                                        )}

                                                    </div>


                                                    <div className="case-arrow">
                                                        →
                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>


                                {/* =================================
                                    COMMON INDICATORS
                                ================================= */}

                                <div className="campaign-section">

                                    <div className="section-heading">

                                        <div>

                                            <h3>
                                                Common Indicators
                                            </h3>

                                            <span>
                                                Infrastructure shared
                                                across investigations
                                            </span>

                                        </div>


                                        <strong>
                                            {indicators.length}
                                        </strong>

                                    </div>


                                    <div className="indicator-list">

                                        {indicators.map(
                                            (indicator, indicatorIndex) => (

                                                <div
                                                    className="indicator-item"
                                                    key={indicatorIndex}
                                                >

                                                    <span className="indicator-type">

                                                        {
                                                            indicator.type ||
                                                            "INDICATOR"
                                                        }

                                                    </span>


                                                    <code>
                                                        {
                                                            indicator.value
                                                        }
                                                    </code>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>


                                {/* =================================
                                    EXPLANATION
                                ================================= */}

                                <div className="campaign-explanation">

                                    <div className="explanation-icon">
                                        ✓
                                    </div>


                                    <div>

                                        <strong>
                                            Why were these cases correlated?
                                        </strong>


                                        <p>
                                            PhishTrace identified shared
                                            indicators across multiple
                                            phishing investigations.
                                            This suggests the activity may
                                            be connected to the same
                                            phishing infrastructure or
                                            campaign.
                                        </p>

                                    </div>

                                </div>


                            </div>

                        );

                    }
                )}

            </div>

        </div>

    );

}


export default Campaigns;