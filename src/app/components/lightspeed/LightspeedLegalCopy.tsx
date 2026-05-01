import { Alert, Content, Flex } from "@patternfly/react-core";
import { css } from "@patternfly/react-styles";
import textStyles from "@patternfly/react-styles/css/utilities/Text/text.mjs";

export const LIGHTSPEED_AI_RESPONSE_FOOTER =
  "Always check AI/LLM generated responses for accuracy prior to use.";

/** PM / legal — AI privacy notice for cluster update AI surfaces (exact approved copy). */
export const CLUSTER_UPDATE_AI_IMPORTANT_TITLE = "Important";

export const CLUSTER_UPDATE_AI_PRIVACY_BODY =
  "This feature uses AI technology. Do not include any personal information or other sensitive information in your input. Interactions may be used to improve Red Hat's products or services.";

export const CLUSTER_UPDATE_AI_PRIVACY_FOOTER_PREFIX =
  "For more information about Red Hat's privacy practices, please refer to the ";

export const CLUSTER_UPDATE_AI_PRIVACY_LINK_LABEL = "Red Hat Privacy Statement";

export const CLUSTER_UPDATE_AI_PRIVACY_LINK_HREF = "https://www.redhat.com/en/about/privacy-policy";

/** Shared body (paragraphs + link) for banner and agent logs panel. */
export function ClusterUpdateAiPrivacyDisclaimerBody() {
  return (
    <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
      <Content component="p" style={{ margin: 0 }}>
        {CLUSTER_UPDATE_AI_PRIVACY_BODY}
      </Content>
      <Content component="p" style={{ margin: 0 }}>
        {CLUSTER_UPDATE_AI_PRIVACY_FOOTER_PREFIX}
        <a href={CLUSTER_UPDATE_AI_PRIVACY_LINK_HREF} target="_blank" rel="noopener noreferrer">
          {CLUSTER_UPDATE_AI_PRIVACY_LINK_LABEL}
        </a>
        .
      </Content>
    </Flex>
  );
}

/** Non-dismissible info banner for Cluster Update (Update plan tab). */
export function ClusterUpdateAiImportantPrivacyBanner() {
  return (
    <Alert variant="info" isInline={false} title={CLUSTER_UPDATE_AI_IMPORTANT_TITLE}>
      <ClusterUpdateAiPrivacyDisclaimerBody />
    </Alert>
  );
}

/** Same disclaimer as {@link ClusterUpdateAiImportantPrivacyBanner}, for slide-over panel chrome (no title). */
export function ClusterUpdateAiImportantPrivacyPanelNotice() {
  return <ClusterUpdateAiPrivacyDisclaimerBody />;
}

export function LightspeedHeaderNotice() {
  return (
    <div
      className={`ols-legal-header-notice ${css(textStyles.fontSizeSm)}`}
      role="region"
      aria-label="Important notice about AI features and privacy"
    >
      <ClusterUpdateAiPrivacyDisclaimerBody />
    </div>
  );
}

export function LightspeedAiMessageFooter() {
  return (
    <p
      className="ols-legal-message-footer"
      style={{
        margin: "0.5rem 0 0 0",
        fontSize: "var(--pf-t--global--font--size--body--sm, 0.75rem)",
        lineHeight: 1.4,
        color: "var(--pf-t--global--text--color--subtle)",
      }}
    >
      {LIGHTSPEED_AI_RESPONSE_FOOTER}
    </p>
  );
}

/** Inline PatternFly alert for AI-generated plan / assessment surfaces (uses approved accuracy copy). */
export function LightspeedAiContentBanner() {
  return (
    <Alert variant="info" isInline title="AI-generated content">
      <Content component="p" style={{ margin: 0 }}>
        {LIGHTSPEED_AI_RESPONSE_FOOTER}
      </Content>
    </Alert>
  );
}

/** Subtle inline disclaimer for dense layouts (e.g. next to metrics). */
export function LightspeedAiAccuracyInline({ className }: { className?: string }) {
  return (
    <p
      className={className}
      style={{
        margin: 0,
        fontSize: "var(--pf-t--global--font--size--body--sm, 0.75rem)",
        lineHeight: 1.4,
        color: "var(--pf-t--global--text--color--subtle)",
      }}
    >
      {LIGHTSPEED_AI_RESPONSE_FOOTER}
    </p>
  );
}
