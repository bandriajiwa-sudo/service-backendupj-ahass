import React from "react";

interface PrintHeaderProps {
  title: string;
  subtitle: string;
  periodLabel: string;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({
  title,
  subtitle,
  periodLabel,
}) => {
  return (
    <div className="hidden print:block w-full mb-6">
      <div className="grid grid-cols-[120px_1fr_120px] items-center border-b-[4px] border-black pb-4 mb-1 border-double">
        <div className="flex justify-center">
          <img
            src="/logo-blpt.png"
            alt="Logo BLPT"
            className="w-[90px] h-auto object-contain"
          />
        </div>
        <div className="text-center">
          <h2 className="text-[1.35rem] font-bold text-black font-serif leading-tight">
            PEMERINTAH DAERAH DAERAH ISTIMEWA YOGYAKARTA
          </h2>
          <h1 className="text-[1.5rem] font-bold text-black mt-1 font-serif leading-tight">
            DINAS PENDIDIKAN, PEMUDA, DAN OLAHRAGA
          </h1>
          <h3 className="text-xl text-black mt-1 uppercase font-serif tracking-widest leading-tight">
            Balai Latihan Pendidikan Teknik
          </h3>
          <p className="text-sm text-black mt-2 font-serif leading-snug">
            Jalan Kyai Mojo 70, Yogyakarta, 55243
            <br />
            Telepon (0274) 513036, 548091, Faksimile (0274) 548091, 561690
            <br />
            Laman: www.blptjogja.or.id, Pos-e: blptjogja@yahoo.com
          </p>
        </div>
        <div></div>
      </div>
      <div className="border-b-[1.5px] border-black mb-6"></div>

      <div className="text-center mb-6">
        <h2 className="text-[1.15rem] font-bold text-black mb-1 uppercase tracking-wider">
          {title}
        </h2>
        <p className="text-sm text-gray-800">{subtitle}</p>
        {periodLabel && (
          <p className="text-sm text-gray-800 mt-[2px]">{periodLabel}</p>
        )}
      </div>
    </div>
  );
};

export default PrintHeader;
