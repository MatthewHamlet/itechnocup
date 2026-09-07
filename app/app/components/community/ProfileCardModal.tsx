"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, UserCheck, UserPlus } from "lucide-react";
import Modal from "./Modal";
import UserAvatar from "./UserAvatar";
import { loadProfileCard, toggleFollow } from "@/lib/community/actions";
import type { ProfileCard } from "@/lib/community/queries";

type Loaded = {
  profile: ProfileCard;
  myPatients: { id: string; name: string }[];
  meId: string | null;
};


export default function ProfileCardModal({
  profileId,
  onClose,
}: {

  profileId: string | null;
  onClose: () => void;
}) {
  return (
    <Modal open={Boolean(profileId)} onClose={onClose} title="Profil" size="lg">

      {profileId && <Body key={profileId} profileId={profileId} />}
    </Modal>
  );
}

function Body({ profileId }: { profileId: string }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadProfileCard(profileId)
      .then((result) => {
        if (cancelled) return;
        if (result) setData(result as Loaded);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  if (failed) {
    return (
      <p className="rounded-2xl bg-white px-5 py-8 text-center text-[14px] text-neutral-500 ring-1 ring-app-line">
        Profilnya tidak bisa dimuat.
      </p>
    );
  }

  if (!data) {
    return (
      <p className="rounded-2xl bg-white px-5 py-8 text-center text-[14px] text-neutral-500 ring-1 ring-app-line">
        Memuat profil…
      </p>
    );
  }

  const { profile, meId } = data;
  const isMe = meId === profile.id;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-app-line">
        <span className="relative inline-grid shrink-0">
          <UserAvatar
            url={profile.avatarUrl}
            initial={profile.initial}
            color={profile.color}
            className="h-16 w-16 text-[22px]"
          />
          {profile.verified && (
            <span
              title="Terverifikasi Farad"
              className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-white text-farad-primary ring-2 ring-white"
            >
              <BadgeCheck size={18} strokeWidth={2.4} />
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-bold leading-6 tracking-tight text-neutral-900">
            {profile.name}
          </p>
          <p className="mt-0.5 text-[13px] text-neutral-500">
            {profile.isCaregiver ? "Pendamping" : "Pasien"}
          </p>


          {profile.bio && (
            <p className="mt-2.5 text-[14px] leading-6 text-neutral-700">{profile.bio}</p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3">
        {[
          { label: "Follower", value: profile.followers },
          { label: "Following", value: profile.following },
          { label: "Tim", value: profile.team },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white px-4 py-3 text-center ring-1 ring-app-line"
          >
            <dd className="text-[20px] font-bold leading-7 tabular-nums text-neutral-900">
              {stat.value}
            </dd>
            <dt className="text-[12px] leading-4 text-neutral-500">{stat.label}</dt>
          </div>
        ))}
      </dl>

      {isMe ? (
        <p className="rounded-2xl bg-app-canvas/60 px-4 py-3 text-center text-[13px] text-neutral-500 ring-1 ring-app-line">
          Ini profil kamu sendiri.
        </p>
      ) : (
        <FollowButton profileId={profile.id} initiallyFollowed={profile.followed} />
      )}
    </div>
  );
}

function FollowButton({
  profileId,
  initiallyFollowed,
}: {
  profileId: string;
  initiallyFollowed: boolean;
}) {

  const [followed, setFollowed] = useState(initiallyFollowed);

  const press = () => {
    setFollowed((v) => !v);
    const fd = new FormData();
    fd.set("profile_id", profileId);
    void toggleFollow({ error: null }, fd);
  };

  return (
    <button
      type="button"
      onClick={press}
      aria-pressed={followed}
      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-farad-primary/40 ${
        followed
          ? "bg-white text-farad-forest ring-1 ring-app-line hover:bg-app-canvas"
          : "bg-farad-primary text-white hover:bg-farad-forest"
      }`}
    >
      {followed ? (
        <>
          <UserCheck size={16} strokeWidth={2.4} />
          Mengikuti
        </>
      ) : (
        <>
          <UserPlus size={16} strokeWidth={2.4} />
          Ikuti
        </>
      )}
    </button>
  );
}
