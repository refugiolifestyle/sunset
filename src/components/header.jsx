import { useRouter } from 'next/router';
import { classNames } from 'primereact/utils';

const navigation = [
  { title: "Inicio", to: "" },
  { title: "Inscrições", to: "inscricoes" },
  { title: "Metas", to: "metas" },
]

export const HeaderNavigation = ({ current }) => {
  const { asPath } = useRouter();
  const [firstPage, ..._] = asPath.slice(1)
    .split('/');

  return <div className="max-w-7xl mx-auto px-6 xl:px-0">
    <div className="flex items-center justify-between h-24">
      <img
        className="h-16"
        src="/assets/sunset.png"
        alt="Workflow"
      />
      <div className="flex items-baseline space-x-4">
        {navigation.map((item, itemIdx) =>
          <a
            key={item.title}
            href={`/${item.to}`}
            className={`transition-all px-3 py-2 rounded-md text-sm font-medium ${firstPage == item.to
              ? "bg-white text-black"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
          >
            {item.title}
          </a>
        )}
      </div>
    </div>
  </div>;
}