import Layout from '../../components/Layout'
import PortfoliosList from "../../components/portfolio/PortfoliosList";

type Props = {
  pftArray: any[]
}
const portfolios = ({ pftArray }: Props) => {

  return (
    <Layout title="Karius | Mes portefeuilles">
        <PortfoliosList />
    </Layout>
  );
}

export default portfolios;
