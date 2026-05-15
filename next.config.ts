import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./features/translation/i18n.ts");

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true
    }
};

export default withNextIntl(nextConfig);
